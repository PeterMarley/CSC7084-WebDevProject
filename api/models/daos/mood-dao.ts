import getConnection from '../../utils/dbConnection';
import { FieldPacket, format as formatSQL, ResultSetHeader, RowDataPacket } from 'mysql2';
import logErrors from '../../../utils/logError';
import Activity from '../obj/mood/Activity';
import Entry from '../obj/mood/Entry';
import Mood from '../obj/mood/Mood';
import Image from '../obj/mood/Image';
import EntryFormDataResponse from '../responses/mood/EntryFormDataResponse';
import EntryDataResponse from '../responses/mood/EntryDataResponse';
import ActivityGroup from '../obj/mood/ActivityGroup';

/**
 * This is a static class in that it may not be instantiated. It's methods may be called to generate response objects after queries the database
 */
class MoodApiDataAccessObject {
	async getVisual(userId: number, cutoff: Date | undefined = undefined) {
		const con = await getConnection();

		// mood frequencies

		const moodFrequencyData = (await con.query(
			formatSQL(
				`SELECT 
					m.name as name,
					COUNT(m.mood_id) as frequency
				FROM tbl_entry e
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				WHERE e.user_id = ?` +
				(cutoff ? `AND e.timestamp > '${cutoff}' ` : ' ') +
				`GROUP BY m.name`
				, [userId]
			)
		)).at(0) as any;

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

		const moodModeData = (await con.query(
			formatSQL(
				`SELECT 
					m.name as name,
					COUNT(m.mood_id) as frequency
				FROM tbl_entry e
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				WHERE e.user_id = ? 
				GROUP BY m.name
				ORDER BY frequency DESC
				LIMIT 1`
				, [userId]
			)
		)).at(0) as any;
		
		
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
				WHERE a.user_id = 94
				GROUP BY m.mood_id, a.activity_id
				ORDER BY e.timestamp DESC`,
				[userId]
			)
		)).at(0) as any;

		const activityMoodCombinations = (await con.query(
			formatSQL(
				`SELECT 
					a.name AS activity,
					m.name AS mood,
					COUNT(*) AS frequency
				FROM tbl_activity a
				RIGHT JOIN tbl_entry_activity ea ON ea.activity_id = a.activity_id
				INNER JOIN tbl_entry e ON e.entry_id = ea.entry_id
				INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
				WHERE e.user_id = ?
				GROUP BY m.mood_id, a.activity_id
				ORDER BY a.name;`,
				[userId]
			)
		)).at(0) as any;
		// chart the various relationships between entries and context
		//		context is activities
		//		entry is ... entry

		// base data is therefore activities, so i want to arragen data by activity
		// what i want to know is for each activity:
		//		what are the counts of each mood
		//		what are the counts of each valence
		//		what are the counts of each arousal




		// console.log(activityMoodRelationships);
		
		// get the most common mood for each activity
		//	get all entries and their activities and mood
		//  compute what is the most common activity for each mood
		
		// console.log(valenceFrequencyData);
		//SELECT CURRENT_TIMESTAMP,e.timestamp,DATEDIFF(e.timestamp,CURRENT_TIMESTAMP), e.notes, e.entry_id FROM tbl_entry e
		//WHERE DATEDIFF(e.timestamp,CURRENT_TIMESTAMP) >= -7;
		con.end();

		return {
			frequencies: {
				mood: moodFrequencyData,
				valence: valenceFrequencyData,
				arousal: arousalFrequencyData
			},
			mode: {
				mood: moodModeData
			},
			relationships: {
				activityMoodRelationships,
				activityMoodCombinations
			}
		};
	}

	private sql: any = {
		getEntries: {
			entries: 'CALL usp_select_entries_by_user_id(?)',
			activity: 'CALL usp_select_activities_by_entry_ids(?)',
			images: 'CALL usp_select_entry_images_by_entry_ids(?)'
		},
		newEntry: {
			entryComponents: {
				moods: 'CALL usp_select_moods',
				activities: 'CALL usp_select_activities_by_user_id(?)',
				activityGroups: 'CALL usp_select_activity_groups_by_user_id(?)'
			},
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
			updateEntry: 'CALL usp_update_entry(?,?,?,?)'
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

	async updateSingleEntry(userId: number, entryId: number, entryNotes: string, activityCommaDelimStr: string) {
		const con = await getConnection();
		const sql = formatSQL(
			this.sql.editSingleEntry.updateEntry,
			[userId, entryId, entryNotes, activityCommaDelimStr]
		);
		// console.log('updateSingleEntry formatted sql: ');
		// console.log(sql);


		const response: ResultSetHeader = ((await con.execute(sql)) as Array<any>)[0]
		//console.log(response);

		con.end();
		// console.log('=============================');

		// console.log(response.affectedRows > 0 && response.warningStatus === 0);
		// console.log('=============================');

		return response.affectedRows > 0 && response.warningStatus === 0;
		// i added this wee schneaky line
	}

	async getSingleEntry(userId: number, entryId: number, entryFormData: EntryFormDataResponse) {
		// get data from database
		const con = await getConnection();
		const entry: IDbEntry = (await con.execute(formatSQL(this.sql.getSingleEntry.entry, [userId, entryId])) as Array<any>)[0][0][0];
		const entryImages: IDbEntriesImages[] = (await con.execute(formatSQL(this.sql.getSingleEntry.entryImages, [entryId])) as Array<any>)[0];
		const dbActs: IDbActivity[] = (await con.execute(formatSQL(this.sql.getSingleEntry.entryActivities, [entryId])) as Array<any>)[0];
		con.end();

		const acts: Activity[] = dbActs.map(e => new Activity(e.activityName, e.activityId, new Image(e.iconUrl, e.iconAltText)));
		// console.log(acts);


		// process entry and images
		const images: Image[] = entryImages.map(e => new Image(e.url, e.altText))
		const responseEntry = new Entry(
			entryId,
			entry.timestamp,
			entry.entryNotes,
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
		return new EntryDataResponse(responseEntry, entryFormData, images);
	}

	async getEntryFormData(userId: number) {
		const con = await getConnection();
		const moods: IDbMood[] = (await con.execute(this.sql.newEntry.entryComponents.moods) as Array<any>).at(0).at(0);
		//console.log(moods);

		const activities: IDbActivity[] = (await con.execute(formatSQL(this.sql.newEntry.entryComponents.activities, [userId])) as Array<any>).at(0).at(0);
		const activityGroups: IDbActivityGroup[] = (await con.execute(formatSQL(this.sql.newEntry.entryComponents.activityGroups, [userId])) as Array<any>).at(0).at(0);
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

	async createNewEntry(userId: number, moodName: String, notes: string, activityNameCommaDelimStr: string) {

		let success = true;
		const con = await getConnection();

		try {
			const storedProcedureResponse = (
				await con.execute(
					formatSQL('CALL usp_insert_entry(?,?,?,?)', [userId, moodName, notes, activityNameCommaDelimStr])
				) as ResultSetHeader[])
				.at(0) as ResultSetHeader;
			const { affectedRows, warningStatus } = storedProcedureResponse;
			success = affectedRows > 0 && warningStatus === 0;
		} catch (err: any) {
			logErrors([typeof err == 'string' ? err : err.message]);
			success = false;
		} finally {
			con.end();
		}

		return success;
	}

	async getEntryList(userId: number): Promise<any> {
		// get database data 
		const con = await getConnection();
		const map = new Map<number, Entry>();

		const entries = ((await con.execute(formatSQL(this.sql.getEntries.entries, [userId])) as Array<any>).at(0).at(0)) as Array<IDbEntry>;
		const entryIds = entries.map((e: any) => e.entryId).join(',');

		if (entryIds.length === 0) { // if user has no entries, dont bother processing, return empty object
			// res.json({});
			con.end();
			return {};
		}

		const activities: IDbEntryActivities[] = ((await con.execute(formatSQL(this.sql.getEntries.activity, [entryIds])) as Array<any>).at(0).at(0));
		const entryImages: IDbEntriesImages[] = ((await con.execute(formatSQL(this.sql.getEntries.images, [entryIds])) as Array<any>).at(0).at(0));
		con.end();

		// process data
		try {
			entries.forEach((dbEntry: IDbEntry) => {
				const mood = new Mood(
					dbEntry.moodId,
					dbEntry.mood,
					new Image(dbEntry.moodIconUrl, dbEntry.moodIconAltText),
					dbEntry.moodValence,
					dbEntry.moodArousal);
				map.set(dbEntry.entryId, new Entry(dbEntry.entryId, dbEntry.timestamp, dbEntry.entryNotes, mood))
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

// interface IDbMood {
// 	moodId: number,
// 	moodName: string,
// 	moodOrder: string,
// 	iconUrl: string,
// 	iconAltText: string,
// }

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

export default new MoodApiDataAccessObject();