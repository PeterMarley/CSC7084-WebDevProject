import { Request, Response, NextFunction } from "express";
import apiCall from "../utils/apiCall";
import EntryDataResponse from '../../common/response/EntryDataResponse';
import EntryFormDataResponse from '../../common/response/EntryFormDataResponse';
import SuccessResponse from '../../common/response/SuccessResponse';
import config from "../../common/config/Config";

const regex = {
	contextName: new RegExp(config.contexts.name.regex),
	contextIconUrl: new RegExp(config.contexts.iconUrl.regex)
};

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

		console.log(entryDataResponse.entry?.activities);

		res.locals.entryFormData = entryDataResponse.entryFormData;
		res.locals.entryData = entryDataResponse.entry;
		res.locals.action = 'edit';
		//res.locals.entryAdded = false;

		// console.log(res.locals.formData);

		res.render('mood-entry-edit');
	}
	async createNewEntry(req: Request, res: Response) {
		const { mood, activities, notes } = req.body;

		const errors: string[] = [];
		if (!mood || (typeof mood == 'string' && mood.trim() == '')) {
			errors.push('Required mood field was missing!');
		}

		if (activities === undefined || notes === undefined) {
			errors.push('Form was tampered with!')
		}

		if (errors.length > 0) {
			// TODO more gracefull bad request handling and validation of body
			res.status(400).render('entryfailed', { validationErrors: errors });
			return;
		}

		const p = new URLSearchParams();
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
	async moodContext(req: Request, res: Response) {
		const entryFormDataResponse: EntryFormDataResponse =
			await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');

		res.render('context', { activityGroups: entryFormDataResponse.activityGroups });
	}
	async updateContext(req: Request, res: Response) {
		const { activityName, activityIconUrl } = req.body;
		const activityId = Number(req.params.activityId);
		// validate request body
		const messages: string[] = [];

		if (!activityName) {
			messages.push('Activity Name is required!');
		} else {
			if (!regex.contextName.test(activityName)) messages.push('Activity Name is not valid, must be a-z A-Z 0-9 or whitespace only.');
		}

		if (!activityIconUrl) {
			messages.push('Activity Icon URL is required!');
		} else {
			if (!regex.contextIconUrl.test(activityIconUrl)) messages.push('Activity Icon URL is not a valid URL.');
		}

		if (!activityId) {
			messages.push('The form has been tampered with! Update unsuccessful.');
		}
		if (messages.length > 0) {
			const entryFormDataResponse: EntryFormDataResponse = await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');
			res.render('context', { activityGroups: entryFormDataResponse.activityGroups, messages });
			return;
		}


		// call to API
		const response: SuccessResponse = await apiCall('PUT',
			'/api/mood/' + res.locals.id + '/context/' + activityId,
			new URLSearchParams([
				["activityName", activityName],
				["activityIconUrl", activityIconUrl]
			]));
		const entryFormDataResponse: EntryFormDataResponse = await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');
		res.render('context', { activityGroups: entryFormDataResponse.activityGroups, messages: [response.success ? "Success!" : "Something went wrong!"] })
	}
	async createContext(req: Request, res: Response) {
		const { activityName, activityIconUrl, activityGroupId } = req.body;
		// validate request body
		const messages: string[] = [];

		if (!activityName) {
			messages.push('Activity Name is required!');
		} else {
			if (!regex.contextName.test(activityName)) messages.push('Activity Name is not valid, must be a-z A-Z 0-9 or whitespace only.');
		}

		if (!activityIconUrl) {
			messages.push('Activity Icon URL is required!');
		} else {
			if (!regex.contextIconUrl.test(activityIconUrl)) messages.push('Activity Icon URL is not a valid URL.');
		}

		if (!activityGroupId) {
			messages.push('Form has been tampered with! Context Add was aborted.');
		}

		if (messages.length > 0) {
			const entryFormDataResponse: EntryFormDataResponse = await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');
			res.render('context', { activityGroups: entryFormDataResponse.activityGroups, messages });
			return;
		}

		const response: SuccessResponse = await apiCall('POST', '/api/mood/' + res.locals.id + '/context',
			new URLSearchParams([
				["activityName", activityName],
				["activityIconUrl", activityIconUrl],
				["activityGroupId", activityGroupId]
			]));

		if (response.success) messages.push('New Activity Added!')
		const entryFormDataResponse: EntryFormDataResponse = await apiCall('GET', '/api/mood/' + (res.locals.id ? res.locals.id : '') + '/new');
		res.render('context', { activityGroups: entryFormDataResponse.activityGroups, messages });
		return;
	}
}

export default new MoonController();