import IMood from "./IMood";
import IImage from "./IImage";
import IActivity from "./IActivity";

export default interface Entry {
	entryId: number;
	datetime: Date;
	mood: IMood;
	notes: string;
	images: IImage[];
	activities: IActivity[];
}