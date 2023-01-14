/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express, { Request, Response, NextFunction } from 'express';
import getConnection from '../../../lib/dbConnection';
import mysql2, { Connection } from 'mysql2';
import { verifyToken } from '../../../lib/jwtHelpers';
import { Image, Activity, Entry, Mood, ActivityGroup } from './moodApiClasses';
import { IDbActivity, IDbEntry, IDbActivityGroup, IDbEntryActivities, IDbMood, IDbEntriesImages } from './moodApiInterfaces';

const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));

class MoodApiDataAccessObject {
	#sql = {
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
				buildInsertActivitySql: function (entryId: number, activities: string[], activityMap: Map<string, number>) {
					let sql = `INSERT INTO tbl_entry_activity (entry_id, activity_id) VALUES `;
					activities.forEach(e => sql += mysql2.format(`(?, ?)`, [entryId, activityMap.get(e)]) + ',');
					return sql.substring(0, sql.length - 1);
				}
	
			}
		},
		getSingleEntry: {
			entry: 'CALL usp_select_entry_by_user_id_and_entry_id(?, ?)',
			entryImages:
				`SELECT 
					ei.url AS url,
					ei.alt_text AS altText
				FROM tbl_entry_images ei 
				WHERE ei.entry_id = ?`,
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
			buildInsertActivitySql: function (entryId: number, activities: string[], activityMap: Map<string, number>) {
				let sql = `INSERT INTO tbl_entry_activity (entry_id, activity_id) VALUES `;
				activities.forEach(e => sql += mysql2.format(`(?, ?)`, [entryId, activityMap.get(e)]) + ',');
				return sql.substring(0, sql.length - 1);
			}

		}
	},
	getSingleEntry: {
		entry: 'CALL usp_select_entry_by_user_id_and_entry_id(?, ?)',
		entryImages:
			`SELECT 
				ei.url AS url,
				ei.alt_text AS altText
			FROM tbl_entry_images ei 
			WHERE ei.entry_id = ?`,
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
moodAPI.get(ENTRY_ROUTE + '/new/:userId', getEntryFormData)
moodAPI.post(ENTRY_ROUTE + '/new/:userId', createNewEntry);
moodAPI.get(ENTRY_ROUTE + '/list/:id', getEntryList);
moodAPI.get(ENTRY_ROUTE + '/:userId/:entryId', getEntryFormData, getSingleEntry);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function getSingleEntry(req: Request, res: Response) {
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

	// query database and close connection
	const con = await getConnection();
	const entry: IDbEntry = (await con.execute(mysql2.format(SQL.getSingleEntry.entry, [userId, entryId])) as Array<any>)[0][0][0];
	const entryImages: IDbEntriesImages[] = (await con.execute(mysql2.format(SQL.getSingleEntry.entryImages, [entryId])) as Array<any>)[0];
	con.end();

	// process entry and images
	const images: Image[] = entryImages.map(e => new Image(e.url, e.altText))
	const responseEntry = new Entry(entryId, entry.timestamp, entry.moodId, entry.mood, new Image(entry.moodIconUrl, entry.moodIconAltText), entry.entryNotes);

	// build response
	const response = new EntryDataResponse(responseEntry, res.locals.entryFormData, images);

	res.json(response);
}

async function getEntryFormData(req: Request, res: Response, next: NextFunction) {
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
	const entryFormData = new EntryFormDataResponse(
		moods.map((mood: IDbMood): Mood => new Mood(mood.moodId, mood.moodName, new Image(mood.iconUrl, mood.iconAltText))),
		Array.from(activityMap.values())
	);

	// if entry id and user id specified in parameter (therefore an edit entry action) then call next method, otherwise, return response object
	if (req.params.entryId && req.params.userId) {
		res.locals.entryFormData = entryFormData;
		next();
		return;
	}
	res.json(entryFormData);
}

async function createNewEntry(req: Request, res: Response) {
	let success = false;

	let con: any;

	try {
		const userId = req.params.userId;
		const { mood: moodNameForm, activities: activitesDelimitedStrForm, notes: notesForm } = req.body;
		con = await getConnection();
		// TODO limit number of entries than can be added to a single day maybe?

		// get mood id

		const { getMoodId, insertEntry, getActivities, buildInsertActivitySql } = SQL.newEntry.addEntry;

		const moodId: number = (await con.execute(mysql2.format(getMoodId, [moodNameForm, userId])) as Array<any>)[0][0][0].moodId;

		// add entry & get id
		const entryId: number = (await con.execute(mysql2.format(insertEntry, [notesForm, userId, moodId])) as any)[0][0][0].entryId;


		// add activities
		const activitiesSelectSql = mysql2.format(getActivities, [userId, activitesDelimitedStrForm]);
		const activities: IDbActivity[] = (await con.execute(activitiesSelectSql) as Array<any>)[0][0];

		const activityMap = new Map<string, number>();
		activities.forEach((a: IDbActivity) => activityMap.set(a.activityName, a.activityId));

		await con.execute(buildInsertActivitySql(entryId, activitesDelimitedStrForm.split(','), activityMap));

		success = true;

	} catch (err: any) {
		req.statusCode = 500;
		console.log(err.message);

	} finally {
		if (con !== undefined && con.hasOwnProperty('end')) con.end();
	}

	res.json({ success });
}

async function getEntryList(req: Request, res: Response) {

	// validate user id
	//const userId = parseInt(req.url.replace(ENTRY, ''));
	const userId = req.params.id;

	if (userId === null || userId === undefined || Number.isNaN(userId)) {
		res.status(400).json({ success: false });
		return;
	}

	// get database data 
	const con = await getConnection();
	const map = new Map<number, Entry>();

	const entries = ((await con.execute(mysql2.format(SQL.getEntries.entries, [userId])) as Array<any>).at(0).at(0)) as Array<IDbEntry>;
	const entryIds = entries.map((e: any) => e.entryId).join(',');

	if (entryIds.length === 0) { // if user has no entries, dont bother processing, return empty object
		res.json({});
		con.end();
		return;
	}

	const activities: IDbEntryActivities[] = ((await con.execute(mysql2.format(SQL.getEntries.activity, [entryIds])) as Array<any>).at(0).at(0));
	const entryImages: IDbEntriesImages[] = ((await con.execute(mysql2.format(SQL.getEntries.images, [entryIds])) as Array<any>).at(0).at(0));
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
		entryImages.forEach((entryImage: IDbEntriesImages) => {
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

	res.status(200).json(response);
}


/*******************************************************
 * 
 * RESPONSE OBJECTS
 * 
 *******************************************************/

class EntryFormDataResponse {
	moods: Mood[];
	activityGroups: ActivityGroup[];
	constructor(moods: Mood[], activityGroups: ActivityGroup[]) {
		this.moods = moods;
		this.activityGroups = activityGroups;
	}
}

class EntryDataResponse {
	entry: Entry;
	entryFormData: EntryFormDataResponse;

	constructor(entry: Entry, entryFormData: EntryFormDataResponse, entryImages: Image[]) {
		this.entry = entry;
		this.entry.images = entryImages;
		this.entryFormData = entryFormData;
	}
}

export default moodAPI;