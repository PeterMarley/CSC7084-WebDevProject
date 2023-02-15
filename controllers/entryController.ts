import { Request, Response, NextFunction } from "express";
import apiCall from "../utils/apiCall";
import EntryDataResponse from '../api/models/responses/mood/EntryDataResponse';
import EntryFormDataResponse from '../api/models/responses/mood/EntryFormDataResponse';
import SuccessResponse from '../api/models/responses/SuccessResponse';

function initialiseLocalsForEntryEdit(req: Request, res: Response, next: NextFunction) {
	res.locals.updateSingleEntrySuccess = null;
	res.locals.initialiseLocalsForEntryEdit = null;
	res.locals.entryFormData = null;
	res.locals.entryData = null;
	res.locals.action = null;
	next();
}

async function deleteEntry(req: Request, res: Response, next: NextFunction) {
	const deleteEntryResponse: any = await apiCall('DELETE', '/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId);
	next();
}

async function postEdit(req: Request, res: Response) {
	const { activities, notes } = req.body;
	console.log(notes);

	const successResponse: SuccessResponse =
		await apiCall(
			'PUT',
			'/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId,
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
		await apiCall('GET', '/api/mood/entry/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId);

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
		'/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''),
		new URLSearchParams([['mood', mood], ['activities', activities], ['notes', notes]])
	);

	res.locals.entryAdded = response.success ? true : false;

	// TODO redirect to single entry page, not list
	res.redirect('/entry/list');
}

async function getNewEntryForm(req: Request, res: Response) {
	const entryFormDataResponse: EntryFormDataResponse =
		await apiCall('GET', '/api/mood/entry/new/' + (res.locals.id ? res.locals.id : ''));

	res.locals.entryFormData = entryFormDataResponse;
	res.locals.entryData = null;
	res.locals.action = 'new';
	//res.locals.entryAdded = false;
	console.log(res.locals);
	console.log(res.locals.entryFormData.moods);


	res.render('mood-entry-new');
}

async function getEntryList(req: Request, res: Response) {
	const response = await apiCall('GET', '/api/mood/entry/list/' + (res.locals.id ? res.locals.id : ''));

	res.locals.entries = response || {};
	res.render('mood-entry-list');
}

function getActivity(req: Request, res: Response, next: NextFunction) {
	res.send('not yet implemented');
}

const controller = {
	getEntryList,
	getNewEntryForm,
	createNewEntry,
	getEdit,
	postEdit,
	deleteEntry,
	initialiseLocalsForEntryEdit,
	getActivity
};

export default controller;