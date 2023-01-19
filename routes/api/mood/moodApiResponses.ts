import { Image, Activity, Entry, Mood, ActivityGroup } from './moodApiClasses';

/**
 * This Response object holds the data requires to build an Entry form, either for adding a new entry, or editing an existing one.
 */
export class EntryFormDataResponse {
	moods: Mood[];
	activityGroups: ActivityGroup[];
	constructor(moods: Mood[], activityGroups: ActivityGroup[]) {
		this.moods = moods;
		this.activityGroups = activityGroups;
	}
}

/**
 * This Response object holds the data for a single entry, additionally it holds the data required to build an Entry form.
 */
export class EntryDataResponse {
	entry?: Entry;
	entryFormData: EntryFormDataResponse;

	constructor(entry: Entry, entryFormData: EntryFormDataResponse, entryImages: Image[]) {
		this.entry = entry;
		this.entry.images = entryImages;
		this.entryFormData = entryFormData;
	}
}