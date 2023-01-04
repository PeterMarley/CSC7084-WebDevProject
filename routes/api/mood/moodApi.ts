import express, { Request, Response, NextFunction } from 'express';
import getConnection from '../../../lib/dbConnection';
import mysql2, { Connection } from 'mysql2';
import { verifyToken } from '../../../lib/jwtHelpers'
const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

const numRegex = '[0-9]{1,}';
moodAPI.get('/entry/new/' + numRegex, newEntryFormDetails)
moodAPI.post('/entry/new/' + numRegex, newEntry);
moodAPI.get('/entry/list/' + numRegex, getEntries);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function newEntryFormDetails(req: Request, res: Response) {
	const userId = new RegExp(numRegex).exec(req.url);

	// query database and close connection
	const con = await getConnection();
	const moods: DbMood[] = (await con.execute(mysql2.format(SQL.new.list.moods, [userId])) as Array<any>).at(0);
	const activities: DbActivity[] = (await con.execute(mysql2.format(SQL.new.list.activities, [userId])) as Array<any>).at(0);
	const activityGroups: DbActivityGroup[] = (await con.execute(mysql2.format(SQL.new.list.activityGroups, [userId])) as Array<any>).at(0);
	con.end();

	// process activity groups and activities
	let activityMap = new Map<number, ActivityGroup>();

	activityGroups.forEach((ag: any) => {
		const { activityGroupName, activityGroupId, iconUrl: url, iconAltText: altText } = ag;
		activityMap.set(ag.activityGroupId, {
			activityGroupName,
			activityGroupId,
			image: {
				url,
				altText
			},
			activities: []
		});
	});

	activities.forEach((a: any) => {
		const { activityName, activityGroupId, iconUrl: url, iconAltText: altText } = a;
		activityMap.get(activityGroupId)?.activities.push({
			activityName,
			activityGroupId,
			image: {
				url,
				altText
			}
		});
	});

	// send response
	const response = new NewEntryFormResponse(
		moods.map((mood: any): Mood => createMood(mood)),
		Array.from(activityMap.values())
	);
	console.dir(response);

	res.json(response);
}

async function newEntry(req: Request, res: Response) {
	let success = false;

	let con: any;

	try {
		const userId = parseInt(new RegExp(numRegex).exec(req.url)?.at(0)!);
		const { mood: moodName, activities, notes } = req.body;
		con = await getConnection();
		console.dir(Object.getOwnPropertyNames(con));

		// gather ids

		const moodId = (await con.execute(mysql2.format(SQL.new.add.getMoodId, [moodName, userId])) as Array<any>).at(0).at(0).mood_id;

		// add entry

		const insertEntryResult = await con.execute(mysql2.format(SQL.new.add.insertEntry, [notes, userId, moodId])) as any;
		const entryId = insertEntryResult.at(0).insertId

		// add activities

		const activitiesQueryResult = ((await con.execute(mysql2.format(SQL.new.add.getActivities, [userId, req.body.activities.split(',')]))) as Array<any>).at(0);
		const activityMap = new Map<string, number>();
		activitiesQueryResult.forEach((a: { name: string, activity_id: number }) => activityMap.set(a.name, a.activity_id));


		const insertEntryActivitiesSQL = buildEntryActivitiesSql(entryId, activities.split(','), activityMap);

		await con.execute(insertEntryActivitiesSQL);

		success = true;
		console.log(Object.getOwnPropertyNames(con));

	} catch (err) {
		req.statusCode = 500;
	} finally {
		if (con !== undefined && Object.hasOwnProperty('end')) con.end();
	}

	res.json({ success });
}

async function getEntries(req: Request, res: Response) {

	// validate user id
	//const userId = parseInt(req.url.replace(ENTRY, ''));
	let userId;

	try {
		userId = parseInt(new RegExp(numRegex).exec(req.url)?.at(0) || '-1');
	} catch {
		console.log('regex parsing failed in getEntries()');
	} finally {
		if (userId === null || userId === undefined || Number.isNaN(userId)) {
			res.status(400).json({ success: false });
			return;
		}
	}

	// get database data & close connection quickly
	const con = await getConnection();
	const map = new Map<number, Entry>();

	const entries = ((await con.execute(mysql2.format(SQL.entry.entries, [userId])) as Array<any>).at(0).at(0)) as Array<DbEntry>;
	const entryIds = entries.map((e: any) => e.entryId).join(',');

	if (entryIds.length === 0) {
		res.json({});
		return;
	}

	const activities: Array<DbEntryActivities> =
		((await con.execute(mysql2.format(SQL.entry.activity, [entryIds])) as Array<any>).at(0).at(0));
	const entryImages: Array<DbEntriesImagesResult> =
		((await con.execute(mysql2.format(SQL.entry.images, [entryIds])) as Array<any>).at(0).at(0));

	con.end();

	// process data
	try {
		entries.forEach((e: DbEntry) => map.set(e.entryId, createEntry(e)));
		activities.forEach((a: DbEntryActivities) => map.get(a.entryId)?.activities.push(createActivity(a)));
		entryImages.forEach((ei: DbEntriesImagesResult) => map.get(ei.entryId)?.images.push(createImage(ei)));
	} catch (err: any) {
		res.status(500).json({ error: "server ded. rip." });
		return;
	}

	// map to date
	const response: any = {};
	for (const entry of map.values()) {
		const date = entry.datetime.toISOString().substring(0, 10);
		if (response[date]) {
			response[date].push(entry);
		} else {
			response[date] = [entry];
		}
	}

	// sort entries mapped to each day by datetime
	for (const property of Object.getOwnPropertyNames(response)) {
		response[property].sort((a: Entry, b: Entry) => {
			if (a.datetime < b.datetime) return -1;
			if (a.datetime > b.datetime) return 1;
			return 0;
		});
	}

	res.status(200).json(response);
}

/*******************************************************
 * 
 * DATABASE OPERATIONS
 * 
 *******************************************************/

interface DbActivityGroup {
	activityGroupName: string,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

interface DbActivity {
	activityName: string,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

interface DbMood {
	moodName: string,
	moodOrder: string,
	iconUrl: string,
	iconAltText: string,
}

interface DbEntry {
	entryId: number,
	timestamp: string,
	entryNotes: string,
	mood: string,
	iconUrl: string,
	iconAltText: string,
}

interface DbEntryActivities {
	entryId: number,
	activityName: string,
	activityIconUrl: string,
	activityIconAltText: string,
	activityGroup: string,
	activityGroupIconUrl: string,
	activityGroupIconAltText: string,
}

interface DbEntriesImagesResult {
	url: string,
	altText: string,
	entryId: number
}

const SQL = {
	entry: {
		entries: 'CALL usp_select_entries_by_user_id(?)',
		activity: 'CALL usp_select_activities_by_entry_ids(?)',
		images: 'CALL usp_select_entry_images_by_entry_ids(?)'
	},
	new: {
		list: {
			moods:
				`SELECT
					m.name AS moodName,
					m.order AS moodOrder,
					mi.url AS iconUrl,
					mi.alt_text As iconAltText
				FROM tbl_mood m
				LEFT JOIN tbl_mood_image mi ON mi.mood_image_id = m.icon_image_id
				WHERE m.user_id = ?`,
			activities:
				`SELECT
					a.name AS activityName,
					a.activity_group_id AS activityGroupId,
					ai.url AS iconUrl,
					ai.alt_text AS iconAltText
				FROM tbl_activity a 
				INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
				WHERE a.user_id = ?`,
			activityGroups:
				`SELECT
					ag.name AS activityGroupName,
					ag.activity_group_id AS activityGroupId,
					agi.url AS iconUrl,
					agi.alt_text AS iconAltText
				FROM tbl_activity_group ag
				INNER JOIN tbl_activity_group_image agi ON agi.activity_group_image_id = ag.icon_image_id 
				WHERE ag.user_id = ?`
		},
		add: {
			getMoodId: `SELECT mood_id FROM tbl_mood WHERE tbl_mood.name = ? AND tbl_mood.user_id = ?`,
			getActivities:
				`SELECT 
					a.activity_id,
					a.name,
					ai.url,
					ai.alt_text
				FROM tbl_activity a 
				INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
				WHERE a.user_id = ? 
				AND a.name IN (?)`,
			insertEntry:
				`INSERT INTO tbl_entry (tbl_entry.notes, tbl_entry.user_id, tbl_entry.mood_id)
				VALUES (?,?,?)`,
			insertActivity: {
				insert: `INSERT INTO tbl_entry_activity (entry_id, activity_id) VALUES `,
				values: `(?, ?)`,
			}
		}
	}
}

function buildEntryActivitiesSql(entryId: number, activities: string[], activityMap: Map<string, number>) {
	let sql = SQL.new.add.insertActivity.insert;
	activities.forEach(e => {
		sql += mysql2.format(SQL.new.add.insertActivity.values, [entryId, activityMap.get(e)]) + ','
	});
	return sql.substring(0, sql.length - 1);
}

/*******************************************************
 * 
 * FACTORY METHODS
 * 
 *******************************************************/


// TODO sort out these object literal return types
function createActivity(e: any): { name: string, image: Image, group: { name: string, image: Image } } {
	return {
		name: e.activityName,
		image: {
			url: e.activityIconUrl,
			altText: e.activityIconAltText
		},
		group: {
			name: e.activityGroup,
			image: {
				url: e.activityGroupIconUrl,
				altText: e.activityGroupIconAltText
			}
		}
	};
}

function createActivityGroup(e: any) {
	return {
		activityGroupName: e.activityGroupName,
		activityGroupId: e.activityGroupId,
		image: createImage(e.image),
		activities: e.activities,
	}
}

function createEntry(e: any): Entry {
	return {
		entryId: e.entryId,
		datetime: e.timestamp,
		mood: {
			name: e.mood,
			image: {
				url: e.iconUrl,
				altText: e.iconAltText
			}
		},
		notes: e.entryNotes,
		activities: [],
		images: []
	};
}

function createImage(e: any): Image {
	return {
		url: e.url,
		altText: e.altText
	}
}

function createMood(e: any): Mood {
	return {
		name: e.moodName,
		image: {
			url: e.iconUrl,
			altText: e.iconAltText
		}
	}
}

/*******************************************************
 * 
 * INTERFACES
 * 
 *******************************************************/


interface Activity {
	activityName: string,
	activityGroupId: number,
	image: Image,
}

interface ActivityGroup {
	activityGroupName: string,
	activityGroupId: number,
	image: Image,
	activities: Activity[],
}

interface Entry {
	entryId: number,
	datetime: Date,
	mood: Mood,
	notes: string,
	images: Image[],
	activities: any[],
}

interface Image {
	url: string,
	altText: string
}

interface Mood {
	name: string,
	image: Image
}


/*******************************************************
 * 
 * RESPONSE OBJECTS
 * 
 *******************************************************/



class NewEntryFormResponse {
	moods: Mood[];
	activityGroups: ActivityGroup[];
	constructor(moods: Mood[], activityGroups: ActivityGroup[]) {
		this.moods = moods;
		this.activityGroups = activityGroups;
	}
}

export default moodAPI;