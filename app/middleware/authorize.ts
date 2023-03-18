import { createToken, verifyToken } from '../utils/jwtHelpers';
import { Request, Response, NextFunction } from 'express';

export function authorize(req: Request, res: Response, next: NextFunction) {
	let success = false;
	if (req.cookies && req.cookies.token) {
		try {
			const token: any = verifyToken(req.cookies.token);
			if (Date.now() < token.expiry) {
				success = true;
				res.locals.username = token.username;
				res.locals.id = token.id;
			} else {
				res.clearCookie('token');
			}
		} catch (err) {
			res.clearCookie('token');
		}
	}

	res.locals.authed = success;
	next();
}

