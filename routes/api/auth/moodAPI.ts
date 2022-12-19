import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import RegistrationResponse from '../../../models/RegistrationResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
import { encrypt } from '../../../lib/crypt';
import { JwtPayload } from 'jsonwebtoken';
import authenticateRequestSource from '../../../lib/authenticateRequestSource';

const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));
moodAPI.use(authenticateRequestSource);

moodAPI.post('/entry', (req: Request, res: Response) => {
	//mood
	//TODO entry image urls/ image files (for now - will make uploads later on)
	//entry activity(s)
});

moodAPI.get('/entry', async (req: Request, res: Response) => {
	
	let token;
	try {
		token = verifyToken(req.cookies.token);
	} catch {
		res.send('token verification failed!');
		return;
	}
	
	const con = await getConnection();
	console.log(req.cookies.token);
	const result = await con.execute('SELECT * FROM tbl_entry WHERE user_id=?', [94/*token*/]);
	const results = result.at(0);
	console.log(results);
	
	/*
	SELECT 
e.entry_id AS entry_id,
	e.timestamp AS `timestamp`,
	m.name AS mood,
	a.name AS activity,
FROM tbl_entry e
INNER JOIN tbl_mood AS m ON m.mood_id = e.mood_id
INNER JOIN tbl_entry_activity AS ea ON ea.entry_id = e.entry_id
INNER JOIN tbl_activity AS a ON ea.activity_id = a.activity_id
-- LEFT JOIN tbl_entry_images AS ei ON ei.entry_id = e.entry_id
INNER JOIN tbl_activity_image AS ai ON ai.activity_image_id = a.icon_image_id

WHERE e.user_id = (SELECT user_id FROM tbl_user WHERE tbl_user.username='randomcrap2');

SELECT * 
FROM tbl_entry e
INNER JOIN tbl_mood AS m ON m.mood_id = e.mood_id
INNER JOIN tbl_entry_activity AS ea ON ea.entry_id = e.entry_id
INNER JOIN tbl_activity AS a ON ea.activity_id = a.activity_id
-- LEFT JOIN tbl_entry_images AS ei ON ei.entry_id = e.entry_id
WHERE e.user_id = (SELECT user_id FROM tbl_user WHERE tbl_user.username='randomcrap2');
	*/


	/* 
	
	add entry
	add entry images
	add entry activities
	
	*/

	res.json(results);
})

export default moodAPI;