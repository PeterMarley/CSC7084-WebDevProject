import { LoginResponse } from '../../models/authResponses';
import { createToken, verifyToken } from '../../lib/jwtHelpers';
import getConnection from '../../lib/dbConnection';
import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql';

/**
 * Login form - submit
 * try to login
 * if successfull
 *    redirect to redirect#
 * if not successfull
 *    redirect to unsuccessful login opage
 */

/**
 * Express middleware for processing login POST requests.
 * 
 * `req.body.username` and `req.body.password` properties are required, or a 400 status will be returned
 * 
 * If they are present this middleware will validate the username/ password combination is correct, and if it is will set a JWT cookie and call next()
 * 
 * Dependency injection is used here to enable unit and functional testing using mocks
 */
export default async function login(req: Request, res: Response, next: NextFunction, getConnectionFunction = getConnection, callback = cb) {

	// validate the request post body
	const err: Array<string> = [];
	// validate post body properties and http request method
	if (req.method != 'POST') {
		err.push('login requires a POST HTTP request but was ' + req.method + '.');
	}
	if (!req.body.username) {
		err.push('login requires a POST body "username" property.');
	}
	if (!req.body.password) {
		err.push('login requires a POST body "password" property.');
	}

	// if there are errors in post body send error json response
	if (err.length != 0) {
		res.json(new LoginResponse(err));
		return;
	}

	// get db connection and execute function to check password is correct
	const con = getConnectionFunction();

	const { username, password } = req.body;
	con.query(
		'SELECT fn_Check_Password(?,?) AS passwordCorrect',
		[username, password],
		(error, results, fields) => callback(error, results, res, username, next)
	);
	con.end(); // close connection
}

export function cb(error: mysql.MysqlError | null, results: any, res: Response, username: string, next: NextFunction) {
	if (error) throw error;

	const result = results[0].passwordCorrect;

	// if password correct set token cookie to jwt and set express local var to username
	if (result) {
		res.locals.username = username;
		res.cookie('token', createToken(username));
	}

	// either return a response model object or redirect to specified route if redirect property provided in request post body
	next();
}
