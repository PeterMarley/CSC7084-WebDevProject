import IActivity from "../../../../common/model/IActivity";
import IImage from "../../../../common/model/IImage";
import IActivityGroup from '../../../../common/model/IActivityGroup'

export default class ActivityGroup implements IActivityGroup {
	activityGroupName: string;
	activityGroupId: number;
	image: IImage;
	activities: IActivity[];

	constructor(name: string, id: number, image: IImage, activities: IActivity[] = []) {
		this.activityGroupName = name;
		this.activityGroupId = id;
		this.image = image;
		this.activities = activities;
	}
}