import IEntry from '../../../../common/model/IEntry'
import IMood from '../../../../common/model/IMood'
import IImage from '../../../../common/model/IImage'
import IActivity from '../../../../common/model/IActivity'
export default class Entry implements IEntry {
	entryId: number;
	datetime: Date;
	mood: IMood;
	notes: string;
	images: IImage[];
	activities: IActivity[];

	constructor(id: number, timestamp: string, notes: string, mood: IMood) {
		this.entryId = id;
		this.datetime = new Date(timestamp);
		this.mood = mood;
		this.notes = notes;
		this.images = [];
		this.activities = [];
	}
}