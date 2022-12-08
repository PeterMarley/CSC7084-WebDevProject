import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
const auth = express.Router();

/*
API DESCRIPTION

- post username and password to api, get token back?
- require a website token perhaps to limit outside access?
		- this token can live in .env file/ environment variables
*/
auth.use(express.urlencoded({ extended: false }));
auth.use(authenticateRequestSource);
// auth.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

auth.post('/login', login);
// auth.post('/logout', logout);

function authenticateRequestSource(req: Request, res: Response, next: NextFunction) {
		if (req.body && req.body.requestor && process.env.REQUESTOR && req.body.requestor === process.env.REQUESTOR) {
			console.log('valid request source');
			console.log(req.body);
			console.log(req.body.requestor);
			console.log(process.env.REQUESTOR);
			
			next();
		} else {
			res.sendStatus(401);
		}
		return;
}


/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

// function logout(req: Request, res: Response, next: NextFunction) {
// 	res.clearCookie('token');
// 	res.statusCode = 200;
// 	res.send(new LoginResponse(true));
// }

async function login(req: Request, res: Response, next: NextFunction) {

	let success: boolean = false;
	let token: string | undefined;
	let error: Array<string> = [];
	const { username, password } = req.body;

	if (username && password) {
		const { id, passwordFromDb, email } = await queryUserPassword(username);
		const correct = checkPasswordCorrect(passwordFromDb, password);
		if (correct) {
			success = true;
			token = createToken(id, username, email);
		}
	} else {
		if (!username) error.push('no username provided');
		if (!password) error.push('no password provided');
	}
	res.set('Content-Type', 'application/json');
	res.statusCode = (error.length != 0) ? 401 : 200;
	res.send(new LoginResponse(success, token, error));
}

async function queryUserPassword(username: string): Promise<PasswordQueryResponse> {
	const con = await getConnection();
	const result = await con.execute('SELECT user_id, password, email FROM tbl_user WHERE username=?', [username]) as any;
	con.end();
	const { user_id, password, email } = result[0][0];
	return new PasswordQueryResponse(user_id, password, email);
}

export default auth;