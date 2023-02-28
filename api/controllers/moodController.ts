import { Request, Response, NextFunction } from "express";
import dao from '../models/daos/mood-dao';
import SuccessResponse from "../models/responses/SuccessResponse";
import logErrors from "../../app/utils/logError";
import EntryDataResponse from "../models/responses/mood/EntryDataResponse";
import EntryFormDataResponse from "../models/responses/mood/EntryFormDataResponse";

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
			const response = await dao.deleteSingleEntry(userId, entryId);
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

	const success: boolean = await dao.updateSingleEntry(
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
	const entryResponse: EntryDataResponse = await dao.getSingleEntry(userId, entryId, res.locals.entryFormData);
	res.json(entryResponse);
}

async function getEntryFormData(req: Request, res: Response, next: NextFunction) {
	// get userid from url
	let response: SuccessResponse | EntryFormDataResponse;
	let statusCode = 200;
	const userId = Number(req.params.userId);

	if (!userId) {
		statusCode = 400;
		response = new SuccessResponse(false, [`userId was not numberic value: ${userId}`]);
	} else {
		try {
			// get data from database and process
			response = await dao.getEntryFormData(userId);
		} catch (err: any) {
			statusCode = 500;
			response = new SuccessResponse(false, [typeof err == 'string' ? err : err.message]);
		}

		// if entry id and user id specified in parameter (therefore an edit entry action) then call next method, otherwise, return response object
		if (req.params.entryId !== undefined && req.params.userId !== undefined) {
			res.locals.entryFormData = response;
			next();
			return;
		}

	}

	res.status(statusCode).json(response);
}

async function createNewEntry(req: Request, res: Response) {

	// get user id from route
	const userId = Number(req.params.userId);
	let success = false;
	let statusCode = 201;

	let {
		mood,
		activities: activityNameCommaDelimStr,
		notes
	} = req.body;

	// normalise empty values from body
	if (!activityNameCommaDelimStr) activityNameCommaDelimStr = '';
	if (!notes) notes = '';

	const errors: string[] = [];

	if (!userId || !mood) {
		statusCode = 400;

		if (!userId) errors.push(`userId was not a numeric value: ${userId}`);
		else if (!mood) errors.push(`mood was not provided: ${mood}`);

	} else {
		try {
			success = await dao.createNewEntry(userId, mood, notes, activityNameCommaDelimStr);
		} catch (err: any) {
			statusCode = 500;
			errors.push(typeof err == 'string' ? err : err.message);
		}
	}

	res.status(statusCode).json(new SuccessResponse(success, errors));
}

/**
 * Get a list of mood entries from the database, using the user's id.
 */
async function getEntryList(req: Request, res: Response) {

	let response: any;
	let statusCode = 200;
	const userId = Number(req.params.userId);

	if (Number.isNaN(userId)) {
		res.status(400).json(new SuccessResponse(false, [`userId was not accepted: ${userId}`]));
		return;
	}

	try {
		// TODO build proper response interface/ class
		response = await dao.getEntryList(userId);
		if (response.hasOwnProperty('success') && response.error) {
			statusCode = 500;
		}
	} catch (err: any) {
		response = new SuccessResponse(false, [typeof err == 'string' ? err : err.message]);
		statusCode = 500;
	}

	res.status(statusCode).json(response);
}

const controller = {
    deleteSingleEntry,
    updateSingleEntry,
    getSingleEntry,
    getEntryFormData,
    createNewEntry,
    getEntryList,
};

export default controller;