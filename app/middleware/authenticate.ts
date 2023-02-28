import { createToken, verifyToken } from '../utils/jwtHelpers';
import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
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
			else console.log(err);
		}
	}

	res.locals.authed = success;
	// if (success === false) {
	// 	//res.redirect(200, '/forbidden');
	// 	res.render('forbidden');
	// 	return;
	// }
	next();
}

export function restrictedArea(req: Request, res: Response, next: NextFunction) {
	if (!res.locals.authed) {
		res.render('forbidden');
		return;
	}
	next();
}