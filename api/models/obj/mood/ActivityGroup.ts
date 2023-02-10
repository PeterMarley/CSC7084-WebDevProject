import Activity from "./Activity";
import Image from "./Image";

export default class ActivityGroup {
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