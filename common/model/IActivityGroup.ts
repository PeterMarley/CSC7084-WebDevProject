import IActivity from "./IActivity";
import IImage from "./IImage";

export default interface ActivityGroup {
	activityGroupName: string;
	activityGroupId: number;
	image: IImage;
	activities: IActivity[];
}