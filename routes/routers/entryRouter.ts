import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import apiCall from '../../lib/apiCall';
import authenticate from '../middleware/authenticate';

const entryRouter = express.Router();
entryRouter.use(authenticate);
entryRouter.use(cookieParser())

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', getList);
entryRouter.get('/new', getNew);
entryRouter.post('/new', postNew);
entryRouter.get('/edit/:entryId', getEdit);

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

async function getEdit(req: Request, res: Response) {
	const entryData = await apiCall('GET', 'http://localhost:3000/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId);

	res.locals.formData = entryData || {};
	res.locals.action = 'edit';
	res.locals.entryAdded = false;

	// console.log(res.locals.formData);
	
	res.render('mood-entry-edit');
}

async function postNew(req: Request, res: Response) {
	const { mood, activities, notes } = req.body;
	if (mood === undefined || activities === undefined || notes === undefined) {
		// TODO more gracefull bad request handling and validation of body
		res.status(400).json({ success: false, body: req.body });
		return;
	}

	const response = await apiCall('POST',
		'http://localhost:3000/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''),
		new URLSearchParams([['mood', mood], ['activities', activities], ['notes', notes]])
	);

	res.locals.entryAdded = response.success ? true : false;

	// TODO redirect to single entry page, not list
	res.redirect('/entry/list');
}

async function getNew(req: Request, res: Response) {
	const response = await apiCall('GET', 'http://localhost:3000/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''));

	res.locals.formData = response || {};
	res.locals.action = 'new';
	res.locals.entryAdded = false;
	
	res.render('mood-entry-new');
}

async function getList(req: Request, res: Response) {
	const response = await apiCall('GET', 'http://localhost:3000/api/mood/entry/list/' + (res.locals.id ? res.locals.id : ''));
	
	res.locals.entries = response || {};
	res.render('mood-entry-list');
}

export default entryRouter;