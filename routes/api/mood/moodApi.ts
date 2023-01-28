/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express, { Request, Response, NextFunction } from 'express';
import MoodApiDataAccessObject from './MoodApiDataAccessObject';
import { EntryDataResponse, EntryFormDataResponse, SuccessResponse } from './moodApiModel';
import logErrors from '../../../lib/logError';

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

const entryOperationsRoute = ENTRY_ROUTE + '/:userId/:entryId';
moodAPI.get(entryOperationsRoute, getEntryFormData, getSingleEntry);
moodAPI.put(entryOperationsRoute, updateSingleEntry);
moodAPI.delete(entryOperationsRoute, deleteSingleEntry);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

/**
 * Express middleware that deletes a single mood entry entry from the database.
 * 
 * Response with a json `SuccessResponse`
 */
async function deleteSingleEntry(req: Request, res: Response) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);

	let success = false;
	let errors: string[] = [];
	let statusCode = 200;

	if (!userId || !entryId) {
		errors.push(`Some request parameters were not numbers: [userId: ${userId}] [entryId: ${entryId}]`);
		statusCode = 400;
	} else {
		try {
			const response = await MoodApiDataAccessObject.deleteSingleEntry(userId, entryId);
			success = response.affectedRows > 0;
			if (!success) {
				statusCode = 404;
				errors.push(
					'the delete operation failed: ' +
					`[${response.affectedRows} rows were deleted] ` +
					`[${response.warningStatus} is the warningStatus of the database]`
				);
			}
		} catch (err: any) {
			errors.push(`deleteSingleEntry() middleware error: ${err}`);
			logErrors(errors);
			statusCode = 500;
		}
	}

	res.status(statusCode).json(new SuccessResponse(success, errors));
}

async function updateSingleEntry(req: Request, res: Response) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const { activities: activityNamesCommaDelimStr, notes: entryNotes } = req.body;
	// console.log('entryNotes in moodApi.updateSingleEntry: ' + entryNotes);

	const success: boolean = await MoodApiDataAccessObject.updateSingleEntry(
		userId, entryId, entryNotes, activityNamesCommaDelimStr
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

	if (!userId && userId !== 0) {
		res.status(400).json(new SuccessResponse(false, [`userId was not accepted: ${userId}`]));
		return;
	}

	// TODO build proper response interface/ class
	const response = await MoodApiDataAccessObject.getEntryList(userId);
	if (response.hasOwnProperty('success') && response.error) {
		statusCode = 500;
	}
	res.status(statusCode).json(response);
}



export default moodAPI;