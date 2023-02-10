import { createToken, verifyToken } from '../common/jwtHelpers';
import { Request, Response, NextFunction } from 'express';

function authenticate(req: Request, res: Response, next: NextFunction) {

	let success = false;
	if (req.cookies && req.cookies.token) {
		try {
			const token: any = verifyToken(req.cookies.token);
			//TODO add a timed checked to ensure token is still valid from data
			if (Date.now() < token.expiry) {
				success = true;
				res.locals.username = token.username;
				res.locals.id = token.id;
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