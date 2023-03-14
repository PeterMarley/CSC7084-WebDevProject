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
async function deleteSingleEntry(req: Request, res: Response, next: NextFunction) {

	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);


	if (!userId || !entryId) {
		const response = new SuccessResponse(false, [`Some request parameters were not numbers: [userId: ${userId}] [entryId: ${entryId}]`]);
		res.status(400).json(response);
		return;
	}

	try {
		const result = await dao.deleteSingleEntry(userId, entryId);
		const success = result.affectedRows > 0;
		let response = new SuccessResponse(success);
		if (!success) {
			res.status(404).json(new SuccessResponse(false,
				[`the delete operation failed: [${result.affectedRows} rows were deleted] [${result.warningStatus} is the warningStatus of the database]`]));
			return;
		}
		res.status(200).json(response);
	} catch (err: any) {
		logErrors([err]);
		next(err);
	}
}

async function updateSingleEntry(req: Request, res: Response, next: NextFunction) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const { activities: activityNamesCommaDelimStr, notes: entryNotes } = req.body;

	try {
		const success: boolean = await dao.updateSingleEntry(userId, entryId, entryNotes, activityNamesCommaDelimStr);
		res.json(new SuccessResponse(success));
	} catch (err: any) {
		logErrors([err]);
		next(err);
	}
}

async function getSingleEntry(req: Request, res: Response, next: NextFunction) {
	// get and validate parameters
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const errors: string[] = [];
	if (!entryId) errors.push('no-entry-id');
	if (!userId) errors.push('no-user-id');
	if (errors.length !== 0) {
		res.status(400).json(new SuccessResponse(false, errors));
		return;
	}

	try {
		res.status(200).json(await dao.getSingleEntry(userId, entryId, res.locals.entryFormData));
	} catch (err: any) {
		logErrors(err);
		next(err);
	}
}

async function getEntryFormData(req: Request, res: Response, next: NextFunction) {
	// get and validate parameters
	const userId = Number(req.params.userId);
	if (!userId) {
		res.status(400).json(new SuccessResponse(false, [`userId was not numberic value: ${userId}`]));
		return;
	}

	try {
		const response = await dao.getEntryFormData(userId);
		// if entry id and user id specified in parameter (therefore an edit entry action) then call next method, otherwise, return response object
		if (req.params.entryId !== undefined && req.params.userId !== undefined) {
			res.locals.entryFormData = response;
			next();
			return;
		}
		res.status(200).json(response);
	} catch (err: any) {
		logErrors([err]);
		next(err);
	}
}

async function createNewEntry(req: Request, res: Response, next: NextFunction) {

	// get and validate parameters
	const userId = Number(req.params.userId);

	let {
		mood,
		activities: activityNameCommaDelimStr,
		notes
	} = req.body; // only mood is required

	// normalise empty values from body
	if (!activityNameCommaDelimStr) activityNameCommaDelimStr = '';
	if (!notes) notes = '';


	const errors: string[] = [];
	if (!userId) errors.push(`userId was not a numeric value: ${userId}`);
	if (!mood) errors.push(`mood was not provided: ${mood}`);

	if (errors.length > 0) {
		res.status(400).json(new SuccessResponse(false, errors));
		return;
	}

	try {
		const success = await dao.createNewEntry(userId, mood, notes, activityNameCommaDelimStr);
		res.status(201).json(new SuccessResponse(success));
	} catch (err: any) {
		logErrors([err]);
		next(err);
	}
}

/**
 * Get a list of mood entries from the database, using the user's id.
 */
async function getEntryList(req: Request, res: Response, next: NextFunction) {

	const userId = Number(req.params.userId);

	if (!userId) {
		res.status(400).json(new SuccessResponse(false, [`userId was not accepted: ${userId}`]));
		return;
	}

	try {
		let statusCode = 200;
		const response = await dao.getEntryList(userId);
		// TODO build proper response interface/ class
		if (response.hasOwnProperty('success') && response.error) {
			statusCode = 500;
		}
		res.status(statusCode).json(response);
	} catch (err: any) {
		logErrors([err]);
		next(err);
	}
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