import Mood from "./Mood";
import Image from "./Image";
import Activity from "./Activity";

export default class Entry {
	entryId: number;
	datetime: Date;
	mood: Mood;
	notes: string;
	images: Image[];
	activities: Activity[];

	constructor(id: number, timestamp: string, notes: string, mood: Mood) {
		this.entryId = id;
		this.datetime = new Date(timestamp);
		this.mood = mood;
		this.notes = notes;
		this.images = [];
		this.activities = [];
	}
}