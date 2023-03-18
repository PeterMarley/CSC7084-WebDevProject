import ActivityGroup from "../model/ActivityGroup";
import Mood from "../model/Mood";

/**
 * This Response object holds the data requires to build an Entry form, either for adding a new entry, or editing an existing one.
 */
export default class EntryFormDataResponse {
	moods: Mood[];
	activityGroups: ActivityGroup[];
	constructor(moods: Mood[], activityGroups: ActivityGroup[]) {
		this.moods = moods;
		this.activityGroups = activityGroups;
	}
}