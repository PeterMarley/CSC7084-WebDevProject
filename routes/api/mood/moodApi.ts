/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express, { Request, Response, NextFunction } from 'express';
import getConnection from '../../../lib/dbConnection';
import mysql2, { Connection } from 'mysql2';
import { verifyToken } from '../../../lib/jwtHelpers'
const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));

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
	},
	getSingleEntry: {
		entry: 'CALL usp_select_entry_by_user_id_and_entry_id(?, ?)',
		entryActivities: //'SELECT * FROM tbl_activity WHERE user_id=? AND entry_id=?'
			`SELECT 
			a.name as activityName,
			a.activity_id as activityId,
			a.activity_group_id as activityGroupId,
			e.entry_id
		FROM tbl_entry_activity ea
		INNER JOIN tbl_activity a ON ea.activity_id = a.activity_id
		INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
		INNER JOIN tbl_entry e ON e.entry_id = ea.entry_id
		WHERE ea.entry_id=?`
	}
}

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

const ENTRY_ROUTE = '/entry';
moodAPI.get(ENTRY_ROUTE + '/new/:userId', newEntryFormDetails)
moodAPI.post(ENTRY_ROUTE + '/new/:userId', newEntryPost);
moodAPI.get(ENTRY_ROUTE + '/list/:id', getEntries);
//moodAPI.get(ENTRY_ROUTE + '/:userId/:entryId', newEntryFormDetails, getEntry);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function getEntry(req: Request, res: Response) {
	// get ids from route params
	const entryId = parseInt(req.params.entryId);
	const userId = parseInt(req.params.userId);

	// validate ids
	const errors: string[] = [];
	if (!entryId) errors.push('no-entry-id');
	if (!userId) errors.push('no-user-id');
	if (errors.length !== 0) {
		res.status(401).json({ success: false, errors });
		return;
	}

	// do the thing
	const con = await getConnection();
	const moods: IDbMood[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.moods, [userId])) as Array<any>)[0][0];
	const activities: IDbActivity[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activities, [userId])) as Array<any>).at(0).at(0);
	const activityGroups: IDbActivityGroup[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activityGroups, [userId])) as Array<any>).at(0).at(0);

	// console.log(moods);

	const response = (await con.execute(mysql2.format(SQL.getSingleEntry.entry, [userId, entryId])) as Array<any>)[0][0][0];
	const entryActivities = (await con.execute(mysql2.format(SQL.getSingleEntry.entryActivities, [entryId])) as Array<any>)[0];
	// console.log('entryActivities');
	// console.log(entryActivities);
	con.end();




	response.mood = moods.at(moods.findIndex((e: IDbMood) => e.moodId === response.moodId))?.moodName;

	//console.log(entryActivities);
	response.activities = entryActivities;
	console.log(response);

	//response.entryActivities = entryActivities;
	// activities.filter(a => {

	// });
	// console.log(response);

	// res.json({entry: response, formData: res.locals.formData});
	//res.locals.formData.entry = new Entry(response);
	// console.log(res.locals.formData.entry);

	// res.locals.entryData = new EditEntryFormResponse();
	res.json(res.locals.formData);
}

async function newEntryFormDetails(req: Request, res: Response, next: NextFunction) {
	// get userid from url
	const userId = Number(req.params.userId);

	// query database and close connection
	const con = await getConnection();
	const moods: IDbMood[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.moods, [userId])) as Array<any>).at(0).at(0);
	const activities: IDbActivity[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activities, [userId])) as Array<any>).at(0).at(0);
	const activityGroups: IDbActivityGroup[] = (await con.execute(mysql2.format(SQL.newEntry.entryComponents.activityGroups, [userId])) as Array<any>).at(0).at(0);
	con.end();

	// process activity groups and activities
	const activityMap = new Map<number, ActivityGroup>();
	activityGroups.forEach((activityGroup: IDbActivityGroup) => {
		const { activityGroupName, iconUrl, iconAltText } = activityGroup;
		const activityGroupId = parseInt(activityGroup.activityGroupId);
		activityMap.set(activityGroupId, new ActivityGroup(activityGroupName, activityGroupId, new Image(iconUrl, iconAltText)));
	});
	activities.forEach((activity: any) => {
		const { activityName, activityGroupId, iconUrl, iconAltText, activityId } = activity;
		activityMap.get(activityGroupId)?.activities.push(new Activity(activityName, activityId, new Image(iconUrl, iconAltText)));
	});

	// build response
	const entryFormData = new NewEntryFormResponse(
		moods.map((mood: IDbMood): Mood => new Mood(mood.moodId, mood.moodName, new Image(mood.iconUrl, mood.iconAltText))),
		Array.from(activityMap.values())
	);

	// if entry id and user id specified in parameter (therefore an edit entry action) then call next method, otherwise, return response object
	if (req.params.entryId && req.params.user_id) {
		res.locals.entryFormData = entryFormData;
		next();
		return;
	}
	res.json(entryFormData);
}

async function newEntryPost(req: Request, res: Response) {
	let success = false;

	let con: any;

	try {
		const userId = req.params.userId;
		const { mood: moodNameForm, activities: activitesDelimitedStrForm, notes: notesForm } = req.body;
		con = await getConnection();
		// TODO limit number of entries than can be added to a single day maybe?

		// get mood id

		const moodId: number = (await con.execute(mysql2.format(SQL.newEntry.addEntry.getMoodId, [moodNameForm, userId])) as Array<any>)[0][0][0].moodId;

		// add entry & get id
		const entryId: number = (await con.execute(mysql2.format(SQL.newEntry.addEntry.insertEntry, [notesForm, userId, moodId])) as any)[0][0][0].entryId;


		// add activities
		const activitiesSelectSql = mysql2.format(SQL.newEntry.addEntry.getActivities, [userId, activitesDelimitedStrForm]);
		const activities: IDbActivity[] = (await con.execute(activitiesSelectSql) as Array<any>)[0][0];

		const activityMap = new Map<string, number>();
		activities.forEach((a: IDbActivity) => activityMap.set(a.activityName, a.activityId));

		const entryActivitiesInsertSQL = buildEntryActivitiesSql(entryId, activitesDelimitedStrForm.split(','), activityMap);

		await con.execute(entryActivitiesInsertSQL);

		success = true;

	} catch (err: any) {
		req.statusCode = 500;
		console.log(err.message);

	} finally {
		if (con !== undefined && con.hasOwnProperty('end')) con.end();
	}

	res.json({ success });
}

async function getEntries(req: Request, res: Response) {

	// validate user id
	//const userId = parseInt(req.url.replace(ENTRY, ''));
	const userId = req.params.id;

	if (userId === null || userId === undefined || Number.isNaN(userId)) {
		res.status(400).json({ success: false });
		return;
	}

	// get database data & close connection quickly
	const con = await getConnection();
	const map = new Map<number, Entry>();

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
		entries.forEach((dbEntry: IDbEntry) => {
			const { entryId, timestamp, moodId, mood, moodIconUrl, moodIconAltText, entryNotes } = dbEntry;
			map.set(entryId, new Entry(entryId, timestamp, moodId, mood, new Image(moodIconUrl, moodIconAltText), entryNotes))
		});
		activities.forEach((dbActivity: IDbEntryActivities) => {
			const { entryId, activityName, activityId, activityIconUrl, activityIconAltText } = dbActivity;
			map.get(entryId)?.activities.push(new Activity(activityName, activityId, new Image(activityIconUrl, activityIconAltText)))
		});
		entryImages.forEach((entryImage: DbEntriesImages) => {
			const { entryId, url, altText } = entryImage;
			map.get(entryId)?.images.push(new Image(url, altText))
		});
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
			if (a.datetime.getTime() < b.datetime.getTime()) return -1;
			if (a.datetime.getTime() > b.datetime.getTime()) return 1;
			return 0;
		});
	}
	console.log(response);
	
	res.status(200).json(response);
}

/*******************************************************
 * 
 * Database Result Interfaces
 * 
 * These describe the objects returned from database queries
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
	activityId: number,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

interface IDbMood {
	moodId: number,
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
	moodId: number,
	moodIconUrl: string,
	moodIconAltText: string,
}

interface IDbEntryActivities {
	entryId: number,
	activityName: string,
	activityId: number,
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

function buildEntryActivitiesSql(entryId: number, activities: string[], activityMap: Map<string, number>) {
	let sql = SQL.newEntry.addEntry.insertActivity.insert;
	activities.forEach(e => sql += mysql2.format(SQL.newEntry.addEntry.insertActivity.values, [entryId, activityMap.get(e)]) + ',');
	return sql.substring(0, sql.length - 1);
}

/*******************************************************
 * 
 * Classes
 * 
 *******************************************************/

class Activity {
	activityName: string;
	activityId: number;
	image: Image;

	constructor(name: string, id: number, image: Image) {
		this.activityName = name;
		this.image = image;
		this.activityId = id;
	}
}

class Image {
	url: string;
	altText: string;

	constructor(imgUrl: string, imgAltText: string) {
		this.url = imgUrl;
		this.altText = imgAltText;
	}
}


class Entry {
	entryId: number;
	datetime: Date;
	mood: Mood;// | string;
	notes: string;
	images: Image[];
	activities: Activity[];

	constructor(id: number, timestamp: string, moodId: number, moodName: string, moodImage: Image, notes: string, activities: Activity[] = []) {

		this.entryId = id;
		this.datetime = new Date(timestamp);
		this.mood = new Mood(moodId, moodName, moodImage);
		this.notes = notes;
		this.images = [];
		this.activities = activities || [];
	}
}

class Mood {
	moodId: number;
	name: string;
	image: Image;

	constructor(id: number, moodName: string, image: Image) {
		this.moodId = id
		this.name = moodName;
		this.image = image;
	}

}

class ActivityGroup {
	activityGroupName: string;
	activityGroupId: number;
	image: Image;
	activities: Activity[];

	constructor(name: string, id: number, image: Image, activities: Activity[] = []) {
		this.activityGroupName = name;
		this.activityGroupId = id;
		this.image = image;
		this.activities = activities;
	}
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

// class EditEntryFormResponse {
// 	selectedMood: IMood[];
// 	activities: IActivity[];
// 	activityGroups: IActivityGroup[];
// 	constructor(moods: IMood[], activities: IActivity[], activityGroups: IActivityGroup[]) {
// 		this.moods = moods;
// 		this.activities = activities;
// 		this.activityGroups = activityGroups;
// 	}
// }

export default moodAPI;