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
			datetime: {
				dayOfWeek: e.timestamp.getDay(),
				time: e.timestamp.toTimeString().substring(0,8),
				date: {
					day: e.timestamp.getDate(),
					month: e.timestamp.getMonth() + 1,
					year: e.timestamp.getFullYear(),
				}
			},
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

	// map to day
	const mappedToDate = new Map<string, Entry[]>();
	const resp: any = {};
	for (const value of map.values()) {
		// console.log(value);
		const { day, month, year } = value.datetime.date;
		const date = day + '/' + month + '/' + year;
		if (resp[date]) {
			resp[date].push(value);
		} else {
			resp[date] = [value];
		}

	}
	console.dir(resp);
	for (const value of Object.getOwnPropertyNames(resp)) {
		// console.log(value);
		//console.log(resp[value]);
		
		resp[value].sort((a: Entry, b: Entry) => {
			console.log('a: ' + a.datetime.time);
			console.log('b: ' + b.datetime.time);

			if (a.datetime.time < b.datetime.time) {
				console.log(-1);
				return -1;
			}
			if (a.datetime.time > b.datetime.time) {
				console.log(1);
				return 1;
			}
			console.log(0);
			return 0;
			//return a.localeCompare(b);
		});
		 console.log(resp[value]);
		console.log('----------');

	}

	// for (const x in resp) {
	// 	for (const y of resp[x]) {
	// 		console.log(y);

	// 	}
	// 	// console.log(x);

	// 	console.log('==============');

	// }
	// console.dir({ entries: Array.from(map.values()) });
	res.status(200).json({ entries: Array.from(map.values()) });
}

interface Entry {
	entryId: number,
	datetime: {
		dayOfWeek: number,
		time: string,
		date: {
			day: number,
			month: number,
			year: number,
		}
	},
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