import { Request, Response, NextFunction } from "express";
import dao from '../database/mood-dao';
import CreateEntryResponse from "../../common/response/CreateEntryResponse";
import SuccessResponse from "../../common/response/SuccessResponse";

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
			res.status(404).json(new SuccessResponse(false));
			return;
		}
		res.status(200).json(response);
	} catch (err: any) {
		next(err);
	}
}

async function updateSingleEntry(req: Request, res: Response, next: NextFunction) {
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const { activities: activityNamesCommaDelimStr, notes: entryNotes } = req.body;
	console.log(req.body);
	
	try {
		const [statusCode, success] = await dao.updateSingleEntry(userId, entryId, entryNotes, activityNamesCommaDelimStr);
		res.status(statusCode).json(new SuccessResponse(success));
	} catch (err: any) {
		next(err);
	}
}

async function getSingleEntry(req: Request, res: Response, next: NextFunction) {
	// get and validate parameters
	const entryId = Number(req.params.entryId);
	const userId = Number(req.params.userId);
	const errors: string[] = [];
	if (!entryId) errors.push('No Entry Id specified');
	if (!userId) errors.push('No User Id specified');
	if (errors.length > 0) {
		res.status(400).json(new SuccessResponse(false, errors));
		return;
	}

	try {
		const [statusCode, response] = await dao.getSingleEntry(userId, entryId, res.locals.entryFormData);
		res.status(statusCode).json(response);
	} catch (err: any) {
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

	console.log(req.body);
	
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
		const success: CreateEntryResponse = await dao.createNewEntry(userId, mood, notes, activityNameCommaDelimStr);
		res.status(201).json(success);
	} catch (err: any) {
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
		const [statusCode, response] = await dao.getEntryList(userId);
		res.status(statusCode).json(response);
	} catch (err: any) {
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