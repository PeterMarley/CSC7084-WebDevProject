import { format } from "mysql2";
import getConnection from "../../../lib/dbConnection";


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
            updateEntry: 'CALL usp_update_entry(?,?,?,?)'
        },
        deleteSingleEntry: {
            deleteEntry: 'CALL usp_delete_entry(?,?)'
        }
    }

    constructor() { throw new Error('MoodApiDataAccessObject is a static class and may not be instantiated'); }

    static async updateAccountDetails(userId: number, encryptedPassword: string) {
            const updateAccountDetailsSql = format(`CALL usp_update_password(?,?)`, [userId, encryptedPassword]);
            const con = await getConnection();

            const success = ((await con.execute(updateAccountDetailsSql)).at(0) as ResultSetHeader).affectedRows === 1;

            con.end();
    }
}