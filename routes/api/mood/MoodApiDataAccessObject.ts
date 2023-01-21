import getConnection from '../../../lib/dbConnection';
import { Image, Activity, Entry, Mood, ActivityGroup } from './moodApiClasses';
import { EntryDataResponse, EntryFormDataResponse } from './moodApiResponses';
import { format as formatSQL } from 'mysql2';
import { ResultSetHeader } from 'mysql2';

/**
 * This is a static class in that it may not be instantiated. It's methods may be called to generate response objects after queries the database
 */
export default class MoodApiDataAccessObject {
	private static sql: any = {
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
					activities.forEach(e => sql += formatSQL(`(?, ?)`, [entryId, activityMap.get(e)]) + ',');
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
				ea.entry_id AS entryId,
                ai.url as iconUrl,
                ai.alt_text as iconAltText
			FROM tbl_entry_activity ea
			INNER JOIN tbl_activity a ON ea.activity_id = a.activity_id
			INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
            INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
			WHERE ea.entry_id=?`
		},
		editSingleEntry: {
			updateEntry: 'CALL usp_update_entry(?,?,?,?,?)'
		},
		deleteSingleEntry: {
			deleteEntry: 'CALL usp_delete_entry(?,?)'
		}
	}

	constructor() { throw new Error('MoodApiDataAccessObject is a static class and may not be instantiated'); }

	static deleteSingleEntry = async function(userId: number, entryId: number) {
		const con = await getConnection();
		const deleteEntrySQL = formatSQL(MoodApiDataAccessObject.sql.deleteSingleEntry.deleteEntry, [userId, entryId]);
		console.log(deleteEntrySQL);
		
		const response = (await con.execute(deleteEntrySQL) as Array<any>);
		con.end();
		console.log(response);
	}

	static updateSingleEntry = async function (userId: number, entryId: number, entryNotes: string, moodName: string, activityCommaDelimStr: string) {
		const con = await getConnection();
		const sql = formatSQL(
			MoodApiDataAccessObject.sql.editSingleEntry.updateEntry,
			[userId, entryId, entryNotes, moodName, activityCommaDelimStr]
		);
		// console.log('updateSingleEntry formatted sql: ');
		// console.log(sql);
		
		
		const response: ResultSetHeader = ((await con.execute(sql)) as Array<any>)[0]
		console.log(response);
		
		con.end();
		console.log('=============================');
		
		console.log(response.affectedRows > 0 && response.warningStatus === 0);
		console.log('=============================');

		return response.affectedRows > 0 && response.warningStatus === 0;
		// i added this wee schneaky line
	}
	
	static getSingleEntry = async function (userId: number, entryId: number, entryFormData: EntryFormDataResponse) {
		// get data from database
		const con = await getConnection();
		const entry: IDbEntry = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.getSingleEntry.entry, [userId, entryId])) as Array<any>)[0][0][0];
		const entryImages: IDbEntriesImages[] = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.getSingleEntry.entryImages, [entryId])) as Array<any>)[0];
		const dbActs: IDbActivity[] = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.getSingleEntry.entryActivities, [entryId])) as Array<any>)[0];


		const acts: Activity[] = dbActs.map(e => new Activity(e.activityName, e.activityId, new Image(e.iconUrl, e.iconAltText)));
		// console.log(acts);
		con.end();

		// process entry and images
		const images: Image[] = entryImages.map(e => new Image(e.url, e.altText))
		const responseEntry = new Entry(entryId, entry.timestamp, entry.moodId, entry.mood, new Image(entry.moodIconUrl, entry.moodIconAltText), entry.entryNotes);
		responseEntry.activities = acts;
		// build response and send as json
		return new EntryDataResponse(responseEntry, entryFormData, images);
	}

	static getEntryFormData = async function (userId: number) {
		const con = await getConnection();
		const moods: IDbMood[] = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.newEntry.entryComponents.moods, [userId])) as Array<any>).at(0).at(0);
		const activities: IDbActivity[] = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.newEntry.entryComponents.activities, [userId])) as Array<any>).at(0).at(0);
		const activityGroups: IDbActivityGroup[] = (await con.execute(formatSQL(MoodApiDataAccessObject.sql.newEntry.entryComponents.activityGroups, [userId])) as Array<any>).at(0).at(0);
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
		return entryFormData;
	}

	static createNewEntry = async function (userId: number, moodNameForm: String, notesForm: string, activitesDelimitedStrForm: string) {
		const con = await getConnection();
		// TODO limit number of entries than can be added to a single day maybe?

		// get mood id

		const { getMoodId, insertEntry, getActivities, buildInsertActivitySql } = MoodApiDataAccessObject.sql.newEntry.addEntry;

		const moodId: number = (await con.execute(formatSQL(getMoodId, [moodNameForm, userId])) as Array<any>)[0][0][0].moodId;

		// add entry & get id
		const entryId: number = (await con.execute(formatSQL(insertEntry, [notesForm, userId, moodId])) as any)[0][0][0].entryId;


		// process activities
		const activitiesSelectSql = formatSQL(getActivities, [userId, activitesDelimitedStrForm]);
		const activities: IDbActivity[] = (await con.execute(activitiesSelectSql) as Array<any>)[0][0];

		const activityMap = new Map<string, number>();
		activities.forEach((a: IDbActivity) => activityMap.set(a.activityName, a.activityId));

		// insert entry and activities
		const insertionResult: ResultSetHeader = (await con.execute(buildInsertActivitySql(entryId, activitesDelimitedStrForm.split(','), activityMap)) as Array<any>)[0];

		// return true if successful
		if (insertionResult.affectedRows === 0) { return false; }
		return true;
	}

	static getEntryList = async function (userId: number): Promise<any> {
		// get database data 
		const con = await getConnection();
		const map = new Map<number, Entry>();

		const entries = ((await con.execute(formatSQL(MoodApiDataAccessObject.sql.getEntries.entries, [userId])) as Array<any>).at(0).at(0)) as Array<IDbEntry>;
		const entryIds = entries.map((e: any) => e.entryId).join(',');

		if (entryIds.length === 0) { // if user has no entries, dont bother processing, return empty object
			// res.json({});
			con.end();
			return {};
		}

		const activities: IDbEntryActivities[] = ((await con.execute(formatSQL(MoodApiDataAccessObject.sql.getEntries.activity, [entryIds])) as Array<any>).at(0).at(0));
		const entryImages: IDbEntriesImages[] = ((await con.execute(formatSQL(MoodApiDataAccessObject.sql.getEntries.images, [entryIds])) as Array<any>).at(0).at(0));
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
			return { error: "server ded. rip." };
			//res.status(500).json({ error: "server ded. rip." });
		}
		console.log(formatSQL('INSERT INTO tbl VALUES (?);', ['); DROP TABLE tbl;']));
		
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

		return response;
	}
}

/*******************************************************
 * 
 * Mood Api Interfaces
 * 
 * These interfaces describe the responses from database queries
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

interface IDbEntriesImages {
	url: string,
	altText: string,
	entryId: number
}