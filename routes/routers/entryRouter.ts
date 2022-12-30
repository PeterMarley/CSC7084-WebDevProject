import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import apiCall from '../../lib/apiCall';
import getConnection from '../../lib/dbConnection';
import { verifyToken } from '../../lib/jwtHelpers';
import authenticate from '../middleware/authenticate';
const entryRouter = express.Router();

entryRouter.use(authenticate);
entryRouter.use(cookieParser())

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', async (req: Request, res: Response, next: NextFunction) => {
	const response = await apiCall('GET',
		'http://localhost:3000/api/mood/entry/list/' + (res.locals.id ? res.locals.id : ''),
		undefined
	);

	res.locals.entries = response || {};
	res.render('mood-entry-list');
})

entryRouter.get('/new', async (req: Request, res: Response) => {
	const response = await apiCall('GET',
		'http://localhost:3000/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''),
		undefined
	);
		
	res.locals.formData = response || {};
	res.render('mood-entry-new');
})

entryRouter.post('/new', async (req: Request, res: Response) => {
	const { mood, activities, notes } = req.body;
	if (!mood || !activities || !notes) {
		res.status(400).json({ success: false, mood, activities, notes });
		return;
	}

	const response = await apiCall('POST',
		'http://localhost:3000/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''),
		undefined
		//new URLSearchParams([['mood', mood], ['activities', activities], ['notes', notes]])
	);

	res.render('mood-entry-new');
});

export default entryRouter;