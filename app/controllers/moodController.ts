import { Request, Response, NextFunction } from "express";
import apiCall from "../utils/apiCall";
import EntryDataResponse from '../../common/response/EntryDataResponse';
import EntryFormDataResponse from '../../common/response/EntryFormDataResponse';
import SuccessResponse from '../../common/response/SuccessResponse';

class MoonController {
	initialiseLocalsForEntryEdit(req: Request, res: Response, next: NextFunction) {
		res.locals.updateSingleEntrySuccess = null;
		res.locals.initialiseLocalsForEntryEdit = null;
		res.locals.entryFormData = null;
		res.locals.entryData = null;
		res.locals.action = null;

		next();
	}
	async deleteEntry(req: Request, res: Response, next: NextFunction) {
		const deleteEntryResponse: any = await apiCall('DELETE', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId);
		next();
	}
	async postEdit(req: Request, res: Response) {
		const { activities, notes } = req.body;

		const successResponse: SuccessResponse =
			await apiCall(
				'PUT',
				'/api/mood/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId,
				new URLSearchParams([
					['activities', encodeURIComponent(activities)], 
					['notes', encodeURIComponent(notes)],
					['entryId', req.params.entryId]])
			);

		res.locals.updateSingleEntrySuccess = successResponse.success
		res.render('mood-entry-edit');
	}
	async getEdit(req: Request, res: Response) {
		const entryDataResponse: EntryDataResponse =
			await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId);

		res.locals.entryFormData = entryDataResponse.entryFormData;
		res.locals.entryData = entryDataResponse.entry;
		res.locals.action = 'edit';
		//res.locals.entryAdded = false;

		// console.log(res.locals.formData);

		res.render('mood-entry-edit');
	}
	async createNewEntry(req: Request, res: Response) {
		const { mood, activities, notes } = req.body;
		if (mood === undefined || activities === undefined || notes === undefined) {
			// TODO more gracefull bad request handling and validation of body
			res.status(400).json({ success: false, body: req.body });
			return;
		}

		const response = await apiCall(
			'POST',
			'/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new',
			new URLSearchParams([
				['mood', encodeURIComponent(mood)],
				['activities', encodeURIComponent(activities)],
				['notes', encodeURIComponent(notes)]
			])
		);

		res.locals.entryAdded = response.success ? true : false;

		// TODO redirect to single entry page, not list
		res.redirect('/mood/list');
	}
	async getNewEntryForm(req: Request, res: Response) {
		const entryFormDataResponse: EntryFormDataResponse =
			await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');

		res.locals.entryFormData = entryFormDataResponse;
		res.locals.entryData = null;
		res.locals.action = 'new';

		res.render('mood-entry-new');
	}
	async getEntryList(req: Request, res: Response) {
		const response = await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/list');

		res.locals.entries = response || {};
		res.render('mood-entry-list');
	}
	async getVisual(req: Request, res: Response) {
		if (!res.locals.authed) {
			res.status(401).json({ success: false, message: "Not Authorized" })
			return;
		}
		res.render('visual');
	}
}

export default new MoonController();