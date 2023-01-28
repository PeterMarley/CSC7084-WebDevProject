import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import apiCall from '../../lib/apiCall';
import { EntryDataResponse, EntryFormDataResponse, SuccessResponse } from '../api/mood/moodApiModel';
import authenticate from '../middleware/authenticate';
import buildApiUrl from '../../lib/buildApiUrl';

const entryRouter = express.Router();
entryRouter.use(authenticate);
entryRouter.use(cookieParser())

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', getEntryList);

entryRouter.get('/new', getNewEntryForm);
entryRouter.post('/new', createNewEntry);

entryRouter.get('/edit/:entryId', initialiseLocalsForEntryEdit, getEdit);
entryRouter.post('/edit/:entryId', initialiseLocalsForEntryEdit, postEdit);

entryRouter.get('/delete/:entryId', deleteEntry);

entryRouter.get('/activity', (req: Request, res: Response, next: NextFunction) => {
	res.send('not yet implemented');
});

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

function initialiseLocalsForEntryEdit(req: Request, res: Response, next: NextFunction) {
	res.locals.updateSingleEntrySuccess = null;
	res.locals.initialiseLocalsForEntryEdit = null;
	res.locals.entryFormData = null;
	res.locals.entryData = null;
	res.locals.action = null;
	next();
}

async function deleteEntry(req: Request, res: Response) {
	const deleteEntryResponse: any =
		await apiCall(
			'DELETE',
			buildApiUrl('/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId)
		);
	res.json(deleteEntryResponse);
}

async function postEdit(req: Request, res: Response) {
	const { activities, notes } = req.body;
	console.log(notes);

	const successResponse: SuccessResponse =
		await apiCall(
			'PUT',
			buildApiUrl('/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId),
			new URLSearchParams([['activities', activities], ['notes', notes], ['entryId', req.params.entryId]])
		);
	//const x: EntryDataResponse = { entry: undefined, entryFormData: entryDataResponse };
	// console.log('post edit response received by postEdit:');
	// console.log(successResponse);
	
	
	res.locals.updateSingleEntrySuccess = successResponse.success
	res.render('mood-entry-edit');
}

async function getEdit(req: Request, res: Response) {
	const entryDataResponse: EntryDataResponse =
		await apiCall(
			'GET',
			buildApiUrl('/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId)
		);

	res.locals.entryFormData = entryDataResponse.entryFormData;
	res.locals.entryData = entryDataResponse.entry;
	res.locals.action = 'edit';
	//res.locals.entryAdded = false;
			
	// console.log(res.locals.formData);

	res.render('mood-entry-edit');
}

async function createNewEntry(req: Request, res: Response) {
	const { mood, activities, notes } = req.body;
	if (mood === undefined || activities === undefined || notes === undefined) {
		// TODO more gracefull bad request handling and validation of body
		res.status(400).json({ success: false, body: req.body });
		return;
	}

	const response = await apiCall(
		'POST',
		buildApiUrl('/api/mood/entry/new/' + (res.locals.id ? res.locals.id : '')),
		new URLSearchParams([['mood', mood], ['activities', activities], ['notes', notes]])
	);

	res.locals.entryAdded = response.success ? true : false;

	// TODO redirect to single entry page, not list
	res.redirect('/entry/list');
}

async function getNewEntryForm(req: Request, res: Response) {
	const entryFormDataResponse: EntryFormDataResponse =
		await apiCall(
			'GET',
			buildApiUrl('/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''))
		);

	res.locals.entryFormData = entryFormDataResponse;
	res.locals.entryData = null;
	res.locals.action = 'new';
	//res.locals.entryAdded = false;

	res.render('mood-entry-new');
}

async function getEntryList(req: Request, res: Response) {
	const response = await apiCall('GET', process.env.API_BASE_URL + '/api/mood/entry/list/' + (res.locals.id ? res.locals.id : ''));

	res.locals.entries = response || {};
	res.render('mood-entry-list');
}

export default entryRouter;