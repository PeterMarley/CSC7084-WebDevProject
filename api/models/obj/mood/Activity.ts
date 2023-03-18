import IImage from "../../../../common/model/IImage";

export default class Activity {
	activityName: string;
	activityId: number;
	image: IImage;

	constructor(name: string, id: number, image: IImage) {
		this.activityName = name;
		this.image = image;
		this.activityId = id;
	}
}