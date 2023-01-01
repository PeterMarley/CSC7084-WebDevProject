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
	//console.log(userId);

	// query database and close connection
	const con = await getConnection();
	const moods = (await con.execute(mysql2.format(SQL.new.list.moods, [userId])) as Array<any>).at(0);
	const activities = (await con.execute(mysql2.format(SQL.new.list.activities, [userId])) as Array<any>).at(0);
	const activityGroups = (await con.execute(mysql2.format(SQL.new.list.activityGroups, [userId])) as Array<any>).at(0);
	con.end();

	// build response
	let response: NewEntryFormResponse = {
		moods: [],
		activityGroups: []
	};

	// add moods to response
	response.moods = moods.map((mood: any): Mood => {
		return {
			name: mood.moodName,
			image: {
				url: mood.iconUrl,
				altText: mood.iconAltText
			}
		}
	});

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

	response.activityGroups = Array.from(activityMap.values());

	// send response
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

	} catch (err){
		req.statusCode = 500;
	} finally {
		if (con !== undefined && Object.hasOwnProperty('end') ) con.end();
	}

	res.json({ success });
}

function buildEntryActivitiesSql(entryId: number, activities: string[], activityMap: Map<string, number>) {
	let sql = SQL.new.add.insertActivity.insert;
	activities.forEach(e => {
		sql += mysql2.format(SQL.new.add.insertActivity.values, [entryId, activityMap.get(e)]) + ','
	});
	return sql.substring(0, sql.length - 1);
}

async function getEntries(req: Request, res: Response) {

	// validate user id
	//const userId = parseInt(req.url.replace(ENTRY, ''));
	let userId;

	try {
		userId = new RegExp(numRegex).exec(req.url)?.at(0);
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
	// console.log(mysql.format(SQL.entry.entries, [userId]));

	const entries = (await con.execute(mysql2.format(SQL.entry.entries, [userId]))).at(0) as Array<any>;
	const entryIds = entries.map(e => e.entryId);

	if (entryIds.length === 0) {
		res.json({});
		return;
	}

	const activities = (await con.execute(mysql2.format(SQL.entry.activity, [entryIds]))).at(0) as Array<any>;
	const entryImages = (await con.execute(mysql2.format(SQL.entry.images, [entryIds]))).at(0) as Array<any>;
	con.end();

	// process data
	try {
		entries.forEach(e => map.set(e.entryId, entry(e)));
		activities.forEach(e => map.get(e.entryId)?.activities.push(activity(e)));
		entryImages.forEach(e => map.get(e.entryId)?.images.push(image(e)));
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

const SQL = {
	entry: {
		entries:
			`SELECT e.entry_id as entryId,e.timestamp as timestamp, e.notes as entryNotes, m.name as mood, mi.url as iconUrl, mi.alt_text as iconAltText FROM tbl_entry e
			INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
			INNER JOIN tbl_mood_image mi ON mi.mood_image_id = m.icon_image_id
			WHERE e.user_id = ?
			LIMIT 10`,
		activity:
			`SELECT 
				ea.entry_id as entryId,
				a.name as activityName,
				ai.url as activityIconUrl,
				ai.alt_text as activityIconAltText,
				ag.name as activityGroup,
				agi.url as activityGroupIconUrl,
				agi.alt_text as activityGroupIconAltText
			FROM tbl_entry_activity ea 
			INNER JOIN tbl_activity a ON ea.activity_id = a.activity_id
			INNER JOIN tbl_activity_image ai ON a.icon_image_id = ai.activity_image_id
			INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
			INNER JOIN tbl_activity_group_image agi ON agi.activity_group_image_id = ag.icon_image_id
			WHERE ea.entry_id IN (?)`,
		images: 'SELECT url, alt_text as altText, entry_id as entryId FROM tbl_entry_images WHERE entry_id IN (?)'
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

interface NewEntryAddedResponse {
	success: boolean,
	entry: Entry | undefined,
}

interface NewEntryFormResponse {
	moods: Mood[],
	activityGroups: ActivityGroup[]
}

interface ActivityGroup {
	activityGroupName: string,
	activityGroupId: number,
	image: Image,
	activities: Activity[],
}

function activity(e: any): { name: string, image: Image, group: { name: string, image: Image } } {
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

interface Activity {
	activityName: string,
	activityGroupId: number,
	image: Image,
}

function entry(e: any): Entry {
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

interface Entry {
	entryId: number,
	datetime: Date,
	mood: Mood,
	notes: string,
	images: Image[],
	activities: any[],
}

function image(e: any): Image {
	return {
		url: e.url,
		altText: e.altText
	}
}

interface Image {
	url: string,
	altText: string
}

interface Mood {
	name: string,
	image: Image
}



export default moodAPI;