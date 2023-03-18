import IImage from "./IImage";

export default interface Mood {
	moodId: number;
	name: string;
	image: IImage;
	valence: string;
	arousal: string;
}