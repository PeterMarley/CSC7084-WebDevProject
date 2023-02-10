import Image from "./Image";

export default class Activity {
	activityName: string;
	activityId: number;
	image: Image;

	constructor(name: string, id: number, image: Image) {
		this.activityName = name;
		this.image = image;
		this.activityId = id;
	}
}