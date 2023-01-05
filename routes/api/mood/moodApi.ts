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
	const userId = parseInt(new RegExp(numRegex).exec(req.url)?.at(0)!);

	// query database and close connection
	const con = await getConnection();
	const moods: IDbMood[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.moods, [userId])) as Array<any>).at(0).at(0);
	const activities: IDbActivity[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activities, [userId])) as Array<any>).at(0).at(0);
	const activityGroups: IDbActivityGroup[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activityGroups, [userId])) as Array<any>).at(0).at(0);
	con.end();

	// process activity groups and activities
	let activityMap = new Map<number, IActivityGroup>();

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
		moods.map((mood: any): IMood => new Mood(mood)),
		Array.from(activityMap.values())
	);

	res.json(response);
}

async function newEntry(req: Request, res: Response) {
	let success = false;

	let con: any;

	try {
		const userId = parseInt(new RegExp(numRegex).exec(req.url)?.at(0)!);
		const { mood: moodName, activities, notes } = req.body;
		con = await getConnection();
		// TODO limit number of entries than can be added to a single day maybe?
		
		// get mood id

		const { moodId }: { moodId: number } = (await con.execute(mysql2.format(SQL.newEntry.addEntry.getMoodId, [moodName, userId])) as Array<any>)[0][0][0];
		
		// add entry & get id
		const { entryId } = (await con.execute(mysql2.format(SQL.newEntry.addEntry.insertEntry, [notes, userId, moodId])) as any)[0][0][0];
		
		
		// add activities
		const activitiesQueryResult: Array<{ activityId: number, activityName: string, url: string, altText: string }> =
			((await con.execute(mysql2.format(SQL.newEntry.addEntry.getActivities, [userId, req.body.activities]))) as Array<any>).at(0).at(0);

		const activityMap = new Map<string, number>();
		activitiesQueryResult.forEach((a: { activityName: string, activityId: number }) => activityMap.set(a.activityName, a.activityId));


		const insertEntryActivitiesSQL = buildEntryActivitiesSql(entryId, activities.split(','), activityMap);

		await con.execute(insertEntryActivitiesSQL);

		success = true;

	} catch (err: any) {
		req.statusCode = 500;
		console.log(err.message);
		
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
	const map = new Map<number, IEntry>();

	const entries = ((await con.execute(mysql2.format(SQL.getEntries.entries, [userId])) as Array<any>).at(0).at(0)) as Array<IDbEntry>;
	const entryIds = entries.map((e: any) => e.entryId).join(',');

	if (entryIds.length === 0) {
		res.json({});
		return;
	}

	const activities: Array<IDbEntryActivities> = ((await con.execute(mysql2.format(SQL.getEntries.activity, [entryIds])) as Array<any>).at(0).at(0));
	const entryImages: Array<DbEntriesImages> = ((await con.execute(mysql2.format(SQL.getEntries.images, [entryIds])) as Array<any>).at(0).at(0));

	con.end();

	// process data
	try {
		entries.forEach((e: IDbEntry) => map.set(e.entryId, new Entry(e)));
		activities.forEach((a: IDbEntryActivities) => map.get(a.entryId)?.activities.push(new Activity(a)));
		entryImages.forEach((ei: DbEntriesImages) => map.get(ei.entryId)?.images.push(new Image(ei)));
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
		response[property].sort((a: IEntry, b: IEntry) => {
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

interface IDbActivityGroup {
	activityGroupName: string,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

interface IDbActivity {
	activityName: string,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

interface IDbMood {
	moodName: string,
	moodOrder: string,
	iconUrl: string,
	iconAltText: string,
}

interface IDbEntry {
	entryId: number,
	timestamp: string,
	entryNotes: string,
	mood: string,
	moodIconUrl: string,
	moodIconAltText: string,
}

interface IDbEntryActivities {
	entryId: number,
	activityName: string,
	activityIconUrl: string,
	activityIconAltText: string,
	activityGroup: string,
	activityGroupIconUrl: string,
	activityGroupIconAltText: string,
}

interface DbEntriesImages {
	url: string,
	altText: string,
	entryId: number
}

const SQL = {
	getEntries: {
		entries: 'CALL usp_select_entries_by_user_id(?)',
		activity: 'CALL usp_select_activities_by_entry_ids(?)',
		images: 'CALL usp_select_entry_images_by_entry_ids(?)'
	},
	newEntry: {
		entryComponents: {
			moods: 'CALL usp_select_moods_by_user_id(?)',
			activities: 'CALL usp_select_activities_by_user_id(?)',
			activityGroups: 'CALL usp_select_activity_groups_by_user_id(?)'
		},
		addEntry: {
			getMoodId: ' CALL usp_select_mood_by_user_id_and_mood_name(?, ?)',
			getActivities: 'CALL usp_select_activities_by_user_id_and_activity_names(?,?)',
			insertEntry: 'CALL usp_insert_entry(?, ?, ?)',
			insertActivity: {
				insert: `INSERT INTO tbl_entry_activity (entry_id, activity_id) VALUES `,
				values: `(?, ?)`,
			}
		}
	}
}

function buildEntryActivitiesSql(entryId: number, activities: string[], activityMap: Map<string, number>) {
	let sql = SQL.newEntry.addEntry.insertActivity.insert;
	// console.log(activities);
	// console.log(activityMap.get('Work'));
	activities.forEach(e => sql += mysql2.format(SQL.newEntry.addEntry.insertActivity.values, [entryId, activityMap.get(e)]) + ',');
	return sql.substring(0, sql.length - 1);
}

/*******************************************************
 * 
 * Interfaces and Classes
 * 
 *******************************************************/

// Activities
interface IActivity {
	activityName: string,
	activityGroupId?: number,
	group?: IActivityGroup
	image: IImage,
}

class Activity implements IActivity {
	activityName: string;
	image: IImage;

	constructor(iDbEntryActivities: IDbEntryActivities) {
		this.activityName = iDbEntryActivities.activityName;
		this.image = {
			url: iDbEntryActivities.activityIconUrl,
			altText: iDbEntryActivities.activityIconAltText
		}
	}
}

// Images
interface IImage {
	url: string,
	altText: string
}

class Image implements IImage {
	url: string;
	altText: string;

	constructor(data: DbEntriesImages) {
		this.url = data.url;
		this.altText = data.altText
	}
}

// Entries
interface IEntry {
	entryId: number,
	datetime: Date,
	mood: IMood,
	notes: string,
	images: IImage[],
	activities: IActivity[],
}

class Entry implements IEntry {
	entryId: number;
	datetime: Date;
	mood: IMood;
	notes: string;
	images: IImage[];
	activities: IActivity[];

	constructor(data: IDbEntry) {
		this.entryId = data.entryId;
		this.datetime = new Date(data.timestamp);
		this.mood = {
			name: data.mood,
			image: {
				url: data.moodIconUrl,
				altText: data.moodIconAltText
			}
		}
		this.notes = data.entryNotes;
		this.images = [];
		this.activities = [];
	}
}

// Moods
interface IMood {
	name: string,
	image: IImage
}

class Mood implements IMood {
	name: string;
	image: IImage;

	constructor(iMood: IDbMood) {
		this.name = iMood.moodName;
		this.image = {
			url: iMood.iconUrl,
			altText: iMood.iconAltText,
		}
	}

}

// Activity Groups

interface IActivityGroup {
	activityGroupName: string,
	activityGroupId: number,
	image: IImage,
	activities: IActivity[],
}







/*******************************************************
 * 
 * RESPONSE OBJECTS
 * 
 *******************************************************/



class NewEntryFormResponse {
	moods: IMood[];
	activityGroups: IActivityGroup[];
	constructor(moods: IMood[], activityGroups: IActivityGroup[]) {
		this.moods = moods;
		this.activityGroups = activityGroups;
	}
}

export default moodAPI;