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