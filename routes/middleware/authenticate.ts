import { createToken, verifyToken } from '../../lib/jwtHelpers';
import { Request, Response, NextFunction } from 'express';

function authenticate(req: Request, res: Response, next: NextFunction) {
	let success = false;
	if (req.cookies && req.cookies.token) {

		try {
			const token: any = verifyToken(req.cookies.token);
			if (Date.now() < token.expiry) {
				success = true;
				console.log('token authenticated!');
				res.locals.username = token.username;
			} else {
				res.clearCookie('token');
			}
		} catch (err) {
			res.clearCookie('token');
			if (err instanceof Error) console.log(err.message);
		}
	}

	res.locals.authed = success;
	next();
}

/******************************
 * 
 * Exports
 * 
 ******************************/

//module.exports = authenticate;
export default authenticate;