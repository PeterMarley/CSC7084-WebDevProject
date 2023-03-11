import { Request, Response, NextFunction } from "express";
import apiCall from "../utils/apiCall";
import EntryDataResponse from '../../api/models/responses/mood/EntryDataResponse';
import EntryFormDataResponse from '../../api/models/responses/mood/EntryFormDataResponse';
import SuccessResponse from '../../api/models/responses/SuccessResponse';

class EntryController {
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
		console.log(notes);
	
		const successResponse: SuccessResponse =
			await apiCall(
				'PUT',
				'/api/mood/' + (res.locals.id ? res.locals.id : '') + '/' + req.params.entryId,
				new URLSearchParams([['activities', activities], ['notes', notes], ['entryId', req.params.entryId]])
			);
		//const x: EntryDataResponse = { entry: undefined, entryFormData: entryDataResponse };
		// console.log('post edit response received by postEdit:');
		// console.log(successResponse);
	
	
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
			'/api/mood/new/' + (res.locals.id ? res.locals.id : ''),
			new URLSearchParams([['mood', mood], ['activities', activities], ['notes', notes]])
		);
	
		res.locals.entryAdded = response.success ? true : false;
	
		// TODO redirect to single entry page, not list
		res.redirect('/mood/list');
	}
	async getNewEntryForm(req: Request, res: Response) {
		const entryFormDataResponse: EntryFormDataResponse =
			await apiCall('GET', '/api/mood/new/' + (res.locals.id ? res.locals.id : ''));
	
		res.locals.entryFormData = entryFormDataResponse;
		res.locals.entryData = null;
		res.locals.action = 'new';
	
		res.render('mood-entry-new');
	}
	async getEntryList(req: Request, res: Response) {
		const response = await apiCall('GET', '/api/mood/list/' + (res.locals.id ? res.locals.id : ''));
	
		res.locals.entries = response || {};
		res.render('mood-entry-list');
	}
	getActivity(req: Request, res: Response, next: NextFunction) {
		res.send('not yet implemented');
	}
	async getVisual(req: Request, res: Response) {
        if (!res.locals.authed) {
            res.status(401).json({ success: false, message: "Not Authorized" })
            return;
        }
        res.render('visual');
    }
}

export default new EntryController();