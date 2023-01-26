/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express, { Request, Response, NextFunction } from 'express';
import MoodApiDataAccessObject from './MoodApiDataAccessObject';
import { EntryDataResponse, EntryFormDataResponse, SuccessResponse } from './moodApiModel';

const moodAPI = express.Router();

moodAPI.use(express.urlencoded({ extended: false }));


/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

const ENTRY_ROUTE = '/entry';

moodAPI.get(ENTRY_ROUTE + '/new/:userId', getEntryFormData)
moodAPI.post(ENTRY_ROUTE + '/new/:userId', createNewEntry);

moodAPI.get(ENTRY_ROUTE + '/list/:userId', getEntryList);

moodAPI.get(ENTRY_ROUTE + '/:userId/:entryId', getEntryFormData, getSingleEntry);
moodAPI.put(ENTRY_ROUTE + '/:userId/:entryId', updateSingleEntry);

moodAPI.delete(ENTRY_ROUTE + '/delete/:userId/:entryId', deleteSingleEntry);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function deleteSingleEntry(req: Request, res: Response) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	console.log(`moodApi entryId: ${entryId}, userId: ${userId}`);

	MoodApiDataAccessObject.deleteSingleEntry(userId, entryId);

	res.json({ status: 'no response to deleteSingleEntry implemented' });
}



async function updateSingleEntry(req: Request, res: Response) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const { activities: activityNamesCommaDelimStr, mood: moodName, notes: entryNotes } = req.body;
	console.log('entryNotes in moodApi.updateSingleEntry: ' + entryNotes);

	const success: boolean = await MoodApiDataAccessObject.updateSingleEntry(
		userId, entryId, entryNotes, moodName, activityNamesCommaDelimStr
	);
	res.json(new SuccessResponse(success));
}

async function getSingleEntry(req: Request, res: Response) {
	// get ids from route params
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);

	// validate required parameters
	const errors: string[] = [];
	if (!entryId) errors.push('no-entry-id');
	if (!userId) errors.push('no-user-id');
	if (errors.length !== 0) {
		res.status(401).json({ success: false, errors });
		return;
	}

	// get data from database, process, and return response
	const entryResponse: EntryDataResponse = await MoodApiDataAccessObject.getSingleEntry(userId, entryId, res.locals.entryFormData);
	res.json(entryResponse);
}

async function getEntryFormData(req: Request, res: Response, next: NextFunction) {
	// get userid from url
	const userId = Number(req.params.userId);

	// get data from database and process
	const entryFormDataResponse: EntryFormDataResponse = await MoodApiDataAccessObject.getEntryFormData(userId);

	// if entry id and user id specified in parameter (therefore an edit entry action) then call next method, otherwise, return response object
	if (req.params.entryId !== undefined && req.params.userId !== undefined) {
		res.locals.entryFormData = entryFormDataResponse;
		next();
		return;
	}

	res.json(entryFormDataResponse);
}

async function createNewEntry(req: Request, res: Response) {

	// get user id from route
	const userId = Number(req.params.userId);

	// destructure inputs from request body
	const {
		mood: moodNameFromForm,
		activities: activitesDelimitedStrFromForm,
		notes: notesFromForm
	} = req.body;

	const success = await MoodApiDataAccessObject.createNewEntry(userId, moodNameFromForm, notesFromForm, activitesDelimitedStrFromForm);

	res.status(success ? 201 : 500).json({ success });
}

async function getEntryList(req: Request, res: Response) {

	let statusCode = 200;
	const userId = Number(req.params.userId);

	if (userId === null || userId === undefined || Number.isNaN(userId)) {
		res.status(400).json({ success: false });
		return;
	}

	const response = await MoodApiDataAccessObject.getEntryList(userId);
	if (response.hasOwnProperty('success') && response.error) {
		statusCode = 500;
	}
	res.status(statusCode).json(response);
}



export default moodAPI;