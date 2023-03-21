import getConnection from '../utils/dbConnection';
import { FieldPacket, format as formatSQL, ResultSetHeader, RowDataPacket } from 'mysql2';
import logErrors from '../../common/utils/logError';
import Activity from '../../common/model/Activity';
import Entry from '../../common/model/Entry';
import Mood from '../../common/model/Mood';
import Image from '../../common/model/Image';
import EntryFormDataResponse from '../../common/response/EntryFormDataResponse';
import EntryDataResponse from '../../common/response/EntryDataResponse';
import ActivityGroup from '../../common/model/ActivityGroup';
import validator from 'validator';
import CreateEntryResponse from '../../common/response/CreateEntryResponse';

/**
 * This is a static class in that it may not be instantiated. It's methods may be called to generate response objects after queries the database
 */
class MoodApiDataAccessObject {
	async getVisualMoodFrequency(userId: number, cutoff: Date | undefined = undefined) {
		const con = await getConnection();

		// mood frequencies

		const moodFrequencyData = (await con.query(
			formatSQL(
				`SELECT 
					m.name as name,
					COUNT(m.mood_id) as frequency,
					m.mood_valence_id as valence
				FROM tbl_entry e
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				WHERE e.user_id = ?` +
				(cutoff ? `AND e.timestamp > '${cutoff}' ` : ' ') +
				`GROUP BY m.name
				ORDER BY COUNT(m.mood_id) DESC`
				, [userId]
			)
		)).at(0) as any;

		con.end();

		return moodFrequencyData;
	}

	async getVisualMoodArousal(userId: number, cutoff: Date | undefined = undefined) {
		const con = await getConnection();
		const arousalFrequencyData = (await con.query(
			formatSQL(
				`SELECT 
					ma.mood_arousal_name as name,
					COUNT(ma.mood_arousal_name) as frequency
				FROM tbl_entry e
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				INNER JOIN tbl_mood_arousal ma ON ma.mood_arousal_id = m.mood_arousal_id
				WHERE e.user_id = ?` +
				(cutoff ? `AND e.timestamp > '${cutoff}' ` : ' ') +
				`GROUP BY ma.mood_arousal_id`
				, [userId]
			)
		)).at(0) as any;
		con.end();
		return arousalFrequencyData;
	}

	async getVisualMoodValence(userId: number, cutoff: Date | undefined = undefined) {
		const con = await getConnection();
		const valenceFrequencyData = (await con.query(
			formatSQL(
				`SELECT 
					mv.mood_valence_name as name,
					COUNT(mv.mood_valence_name) as frequency
				FROM tbl_entry e
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				INNER JOIN tbl_mood_valence mv ON mv.mood_valence_id = m.mood_valence_id
				WHERE e.user_id = ?` +
				(cutoff ? `AND e.timestamp > '${cutoff}' ` : ' ') +
				`GROUP BY mv.mood_valence_id`
				, [userId]
			)
		)).at(0) as any;
		con.end();
		return valenceFrequencyData;
	}

	async getVisualRelationship(userId: number, cutoff: Date | undefined = undefined) {
		const con = await getConnection();
		const activityMoodRelationships = (await con.query(
			formatSQL(
				`SELECT 
					COUNT(a.activity_id) AS frequency,
					a.name AS activity,
					m.name AS mood,
					mv.mood_valence_name AS valence,
					ma.mood_arousal_name AS arousal,
					e.timestamp AS \`timestamp\` 
				FROM tbl_activity a
				INNER JOIN tbl_entry_activity ea ON ea.activity_id = a.activity_id
				INNER JOIN tbl_entry e ON e.entry_id = ea.entry_id
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				INNER JOIN tbl_mood_arousal ma ON ma.mood_arousal_id = m.mood_arousal_id
				INNER JOIN tbl_mood_valence mv ON mv.mood_valence_id = m.mood_valence_id
				WHERE a.user_id = ?
				GROUP BY m.mood_id, a.activity_id
				ORDER BY e.timestamp DESC`,
				[userId]
			)
		)).at(0) as any;
		con.end();
		return activityMoodRelationships;
	}

	async getVisualSummary(userId: number): Promise<IDbVisualSummary[]> {
		const con = await getConnection();
		try {
			const result = ((await con.execute(formatSQL('CALL usp_get_visual_summary(?)', [userId]))).at(0) as any[])
				.at(0) as IDbVisualSummary[];
			return result;
		} catch (err) {
			logErrors([err]);
			return [];
		}
	}

	/**
	 * Delete a single entry for a particular user
	 * @param userId the user's unique id in the database
	 * @param entryId the entry's unique id in the database
	 */
	async deleteSingleEntry(userId: number, entryId: number) {
		const con = await getConnection();
		const response = (await con.execute(formatSQL('CALL usp_delete_entry(?,?)', [userId, entryId]))).at(0) as ResultSetHeader;
		con.end();
		return response;
	}

	async updateSingleEntry(userId: number, entryId: number, entryNotes: string, activityCommaDelimStr: string): Promise<[number, boolean]> {
		const con = await getConnection();
		try {
			// check entry exits - should be moved into usp_update_entry if i had time
			const checkSql = formatSQL('SELECT COUNT(entry_id) AS `count` FROM tbl_entry WHERE user_id=? AND entry_id=?', [userId, entryId]);
			const check = (await con.execute(checkSql)).at(0) as RowDataPacket;
			if (check.at(0).count === 0) return [404, false];

			// if it exists, update it
			const sql = formatSQL('CALL usp_update_entry(?,?,?,?)', [userId, entryId, entryNotes, activityCommaDelimStr]);
			const response: ResultSetHeader = (await con.execute(sql)).at(0) as ResultSetHeader;

			return (response.affectedRows > 0 && response.warningStatus === 0) ? [200, true] : [200, false];
		} catch (err: any) {
			logErrors([err]);
		} finally {
			con.end();
		}
		return [500, false];
	}

	async getSingleEntry(userId: number, entryId: number, entryFormData: EntryFormDataResponse): Promise<[number, EntryDataResponse | undefined]> {
		// get data from database
		const con = await getConnection();
		const entry: IDbEntry = (await con.execute(formatSQL('CALL usp_select_entry_by_user_id_and_entry_id(?, ?)', [userId, entryId])) as Array<any>)[0][0][0];
		if (!entry) {
			return [404, undefined];
		}

		const entryImages: IDbEntriesImages[] = (await con.execute(formatSQL('CALL usp_select_entry_images_by_entry_id(?)', [entryId])) as Array<any>)[0];
		const dbActs: IDbActivity[] = (await con.execute(formatSQL('CALL usp_select_activities_by_entry_id(?)', [entryId])) as Array<any>)[0][0];
		con.end();

		const acts: Activity[] = dbActs.map(e => new Activity(e.activityName, e.activityId, new Image(e.iconUrl, e.iconAltText)));

		// process entry and images
		const images: Image[] = entryImages.map(e => new Image(e.url, e.altText))
		const responseEntry = new Entry(
			entryId,
			entry.timestamp,
			validator.escape(decodeURIComponent(entry.entryNotes)),
			//entry.entryNotes,
			new Mood(
				entry.moodId,
				entry.mood,
				new Image(
					entry.moodIconUrl,
					entry.moodIconAltText
				),
				entry.moodValence,
				entry.moodArousal
			)

		);
		responseEntry.activities = acts;
		// build response and send as json
		return [200, new EntryDataResponse(responseEntry, entryFormData, images)];
	}

	async getEntryFormData(userId: number) {

		const con = await getConnection();
		const moods: IDbMood[] = (await con.execute('CALL usp_select_moods') as Array<any>).at(0).at(0);
		//console.log(moods);

		const activities: IDbActivity[] = (await con.execute(formatSQL('CALL usp_select_activities_by_user_id(?)', [userId])) as Array<any>).at(0).at(0);
		const activityGroups: IDbActivityGroup[] = (await con.execute(formatSQL('CALL usp_select_activity_groups_by_user_id(?)', [userId])) as Array<any>).at(0).at(0);
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
			moods.map((mood: IDbMood): Mood => new Mood(mood.moodId, mood.moodName, new Image(mood.iconUrl, mood.iconAltText), mood.moodValence, mood.moodArousal)),
			Array.from(activityMap.values())
		);
		//console.log(entryFormData);

		return entryFormData;
	}

	async createNewEntry(userId: number, moodName: String, notes: string, activityNameCommaDelimStr: string): Promise<CreateEntryResponse> {

		let success = true;
		const con = await getConnection();

		try {
			const sql = formatSQL('CALL usp_insert_entry(?,?,?,?,@entryId)', [userId, moodName, validator.escape(notes), activityNameCommaDelimStr]);

			const storedProcedureResponse = (await con.execute(sql)).at(0) as ResultSetHeader
			const entryId = ((await con.query('SELECT @entryId AS entryId')).at(0) as RowDataPacket).at(0).entryId;

			const { affectedRows, warningStatus } = storedProcedureResponse;
			success = affectedRows > 0 && warningStatus === 0;
			return new CreateEntryResponse(success, entryId);
		} catch (err: any) {
			logErrors([err]);
			success = false;
		} finally {
			con.end();
		}

		return new CreateEntryResponse(false, null, ['Something went wrong']);
	}

	async getEntryList(userId: number): Promise<[number, any]> {
		// get database data 
		const con = await getConnection();
		const map = new Map<number, Entry>();

		const entries = ((await con.execute(formatSQL('CALL usp_select_entries_by_user_id(?)', [userId])) as Array<any>).at(0).at(0)) as Array<IDbEntry>;
		const entryIds = entries.map((e: any) => e.entryId).join(',');

		if (entryIds.length === 0) { // if user has no entries, dont bother processing, return empty object
			con.end();
			return [200, {}];
		}

		const activities: IDbEntryActivities[] = ((await con.execute(formatSQL('CALL usp_select_activities_by_entry_ids(?)', [entryIds])) as Array<any>).at(0).at(0));
		const entryImages: IDbEntriesImages[] = ((await con.execute(formatSQL('CALL usp_select_entry_images_by_entry_ids(?)', [entryIds])) as Array<any>).at(0).at(0));
		con.end();

		// process data
		try {
			// set the Map as entryID => Entry object
			entries.forEach((dbEntry: IDbEntry) => {
				const mood = new Mood(
					dbEntry.moodId,
					dbEntry.mood,
					new Image(dbEntry.moodIconUrl, dbEntry.moodIconAltText),
					dbEntry.moodValence,
					dbEntry.moodArousal);
				map.set(dbEntry.entryId, new Entry(dbEntry.entryId, dbEntry.timestamp, validator.escape(decodeURIComponent(dbEntry.entryNotes)), mood))
			});
			// add all activites to relevent entries in map
			activities.forEach((dbActivity: IDbEntryActivities) => {
				const { entryId, activityName, activityId, activityIconUrl, activityIconAltText } = dbActivity;
				map.get(entryId)?.activities.push(new Activity(activityName, activityId, new Image(activityIconUrl, activityIconAltText)))
			});
			// add all entry images to relevent entries in map
			entryImages.forEach((entryImage: IDbEntriesImages) => {
				const { entryId, url, altText } = entryImage;
				map.get(entryId)?.images.push(new Image(url, altText))
			});
		} catch (err: any) {
			logErrors([err]);
			return [500, { error: "Something went wrong processing the entry list." }];
		}
		// console.log(formatSQL('INSERT INTO tbl VALUES (?);', ['); DROP TABLE tbl;']));

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

		return [200, response];
	}
	async updateContext(activityId: number, activityName: string, activityIconUrl: string, userId: number): Promise<[number, any]> {
		const con = await getConnection();

		// ensure it exists before update/insert
		let result = (await con.query(formatSQL('SELECT COUNT(*) AS `count`, icon_image_id AS oldImageId FROM tbl_activity WHERE activity_id=? AND user_id=?', [activityId, userId])));
		let count = (result.at(0) as RowDataPacket).at(0).count;
		let oldImageId = (result.at(0) as RowDataPacket).at(0).oldImageId;

		if (count != 1) {
			con.end();
			return [400, false];
		}

		result = (await con.query(formatSQL('SELECT COUNT(*)  AS `count`, activity_image_id AS imageId FROM tbl_activity_image WHERE url=?', [activityIconUrl])));
		count = (result.at(0) as RowDataPacket).at(0).count;
		let iconId: number;
		if (count == 0) {
			const img = await con.execute(formatSQL("INSERT INTO tbl_activity_image (url, alt_text) VALUES(?,'ALT TEXT')", [activityIconUrl]));
			iconId = (img.at(0) as ResultSetHeader).insertId;
		} else {
			iconId = (result.at(0) as RowDataPacket).at(0).imageId;
			const img = await con.execute(formatSQL("UPDATE tbl_activity_image SET url=?, alt_text='ALT TEXT' WHERE activity_image_id=?", [activityIconUrl, oldImageId]));
		}

		const result2 = await con.execute(formatSQL('UPDATE tbl_activity SET name=?, icon_image_id=?, user_id=? WHERE activity_id=? AND user_id=?',
			[activityName, iconId, userId, activityId, userId]));

		con.end();
		return [200, true];
		// con.query('UPDATE tbl_activity SET name=?,  ')
		// console.log();

	}
	async createContext(activityName: string, activityIconUrl: string, activityGroupId: number, userId: number): Promise<[number, any]> {
		try {
			const con = await getConnection();


			const response = await con.execute(formatSQL("INSERT INTO tbl_activity_image (url, alt_text) VALUES (?,'ALT TEXT')", [activityIconUrl]));
			const newImageId = (response.at(0) as ResultSetHeader).insertId;

			await con.execute(formatSQL("INSERT INTO tbl_activity (name, icon_image_id, activity_group_id, user_id) VALUES (?,?,?,?)", [activityName, newImageId, activityGroupId, userId]));
			return [200, true];
		} catch (err) {
			logErrors([err]);
			return [500, false];
		}
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
	moodValence: string,
	moodArousal: string,
	iconUrl: string,
	iconAltText: string
}

interface IDbEntry {
	entryId: number,
	timestamp: string,
	entryNotes: string,
	mood: string,
	moodId: number,
	moodValence: string,
	moodArousal: string,
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

interface IDbVisualSummary {
	thedate: Date,
	mood: string,
	freq: number,
	valence: string,
	arousal: string
}

export default new MoodApiDataAccessObject();