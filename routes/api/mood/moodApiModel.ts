/*******************************************************
 * 
 * Response Objects
 * 
 *******************************************************/

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

export class SuccessResponse {
	success: boolean;
	errors?: string[];

	constructor(success: boolean, errors: string[] | undefined = undefined) {
		this.success = success;
		if (errors) this.errors = errors;
	}
}

/*******************************************************
 * 
 * Classes
 * 
 *******************************************************/

export class Activity {
	activityName: string;
	activityId: number;
	image: Image;

	constructor(name: string, id: number, image: Image) {
		this.activityName = name;
		this.image = image;
		this.activityId = id;
	}
}

export class Image {
	url: string;
	altText: string;

	constructor(imgUrl: string, imgAltText: string) {
		this.url = imgUrl;
		this.altText = imgAltText;
	}
}

export class Entry {
	entryId: number;
	datetime: Date;
	mood: Mood;
	notes: string;
	images: Image[];
	activities: Activity[];

	constructor(id: number, timestamp: string, moodId: number, moodName: string, moodImage: Image, notes: string) {
		this.entryId = id;
		this.datetime = new Date(timestamp);
		this.mood = new Mood(moodId, moodName, moodImage);
		this.notes = notes;
		this.images = [];
		this.activities = [];
	}
}

export class Mood {
	moodId: number;
	name: string;
	image: Image;

	constructor(id: number, moodName: string, image: Image) {
		this.moodId = id
		this.name = moodName;
		this.image = image;
	}

}

export class ActivityGroup {
	activityGroupName: string;
	activityGroupId: number;
	image: Image;
	activities: Activity[];

	constructor(name: string, id: number, image: Image, activities: Activity[] = []) {
		this.activityGroupName = name;
		this.activityGroupId = id;
		this.image = image;
		this.activities = activities;
	}
}