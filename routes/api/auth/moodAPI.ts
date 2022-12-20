import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import RegistrationResponse from '../../../models/RegistrationResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
import { encrypt } from '../../../lib/crypt';
import { JwtPayload } from 'jsonwebtoken';
import mysql from 'mysql2';
import authenticateRequestSource from '../../../lib/authenticateRequestSource';

const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));
moodAPI.use(authenticateRequestSource);

moodAPI.post('/entry', (req: Request, res: Response) => {
	//mood
	//TODO entry image urls/ image files (for now - will make uploads later on)
	//entry activity(s)
});

const SQL = {
	entry: {
		entry:
			`SELECT e.entry_id as entryId, e.notes as entryNotes FROM tbl_entry e
		INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
		INNER JOIN tbl_mood_image mi ON mi.mood_image_id = m.icon_image_id
		WHERE e.user_id = ?
		LIMIT 10`,
		activity:
			`SELECT 
			ea.entry_id,
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
		WHERE ea.entry_id IN (?)`
	}
}


moodAPI.get('/entry', async (req: Request, res: Response) => {

	let token;
	try {
		token = verifyToken(req.cookies.token);
	} catch {
		res.status(401).send('token verification failed!');
		return;
	}

	const con = await getConnection();

	// get entries from DB
	let result = await con.execute(SQL.entry.entry, [94/*token*/]);
	const entries = result.at(0) as Array<any>;
	
	// get activities and data from db
	result = await con.execute(mysql.format(SQL.entry.activity, [entries.map(e => e.entryId)]));
	const activities = result.at(0) as Array<any>;

	// generate a map of entryid: entry data pairs
	const entriesMap = new Map<number, entry>();
	entries.forEach(e => {
		entriesMap.set(e.entryId, {
			entry_id: e.entryId,
			entry_notes: e.entryNotes,
			images: [],
			activities: []
		});
	});

	console.log(activities);
	
	// add all activities to entry objects
	
	// activities.forEach(e => {
	// 	let x = entriesMap.get(e.entry_id);
	// 	// console.log(x);
		
	// 	x?.activities.push({
	// 		name: e.activityName,
	// 		icon: {
	// 			url: e.activityIconUrl,
	// 			altText: e.activityIconAltText
	// 		}
	// 	})
	// });

	res.json(Object.fromEntries(entriesMap));
})


interface entry {
	entry_id: number,
	entry_notes: string,
	images: image[]
	activities: activityGroup[]
}

interface activity {
	name: string,
	icon: image
}

interface activityGroup {
	name: string,
	icon: image,
	activities: activity[]
}

interface image {
	url: string,
	altText: string
}
export default moodAPI;