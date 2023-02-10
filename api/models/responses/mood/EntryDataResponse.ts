import Entry from "../../obj/mood/Entry";
import EntryFormDataResponse from "./EntryFormDataResponse";
import Image from "../../obj/mood/Image";

export default class EntryDataResponse {
	entry?: Entry;
	entryFormData: EntryFormDataResponse;

	constructor(entry: Entry, entryFormData: EntryFormDataResponse, entryImages: Image[]) {
		this.entry = entry;
		this.entry.images = entryImages;
		this.entryFormData = entryFormData;
	}
}