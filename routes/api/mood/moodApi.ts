import express, { Request, Response, NextFunction } from 'express';
import getConnection from '../../../lib/dbConnection';
import mysql from 'mysql2';
import authenticateRequestSource from '../../../lib/authenticateRequestSource';

const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));
moodAPI.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

const ENTRY = '/entry/';
moodAPI.get(ENTRY + '*', getEntries)

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function getEntries(req: Request, res: Response) {

	// validate user id
	const userId = parseInt(req.url.replace(ENTRY, ''));
	if (userId === null || userId === undefined || Number.isNaN(userId)) {
		res.status(400).json({ success: false });
		return;
	}

	// get database data & close connection quickly
	const con = await getConnection();
	const map = new Map<number, Entry>();

	const entries = (await con.execute(mysql.format(SQL.entry.entries, [userId]))).at(0) as Array<any>;
	const entryIds = entries.map(e => e.entryId);

	if (entryIds.length === 0) {
		res.json({ entries: [] });
		return;
	}

	const activities = (await con.execute(mysql.format(SQL.entry.activity, [entryIds]))).at(0) as Array<any>;
	const entryImages = (await con.execute(mysql.format(SQL.entry.images, [entryIds]))).at(0) as Array<any>;
	con.end();

	// process data
	try {
		entries.forEach(e => map.set(e.entryId, {
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
		}));
		activities.forEach(e => map.get(e.entryId)?.activities.push({
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
		}));
		entryImages.forEach(e => map.get(e.entryId)?.images.push({
			url: e.url,
			altText: e.altText
		}));
	} catch (err: any) {
		res.status(500).json({ error: "server ded. rip." });
		return;
	}

	// map to date
	const response: any = {};
	for (const entry of map.values()) {
		
		const date = entry.datetime.toISOString().substring(0,10);
		const x = new Date(date);
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
	}
}

export default moodAPI;