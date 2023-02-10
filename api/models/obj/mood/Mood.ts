import Image from "./Image";

export default class Mood {
	moodId: number;
	name: string;
	image: Image;
	valence: string;
	arousal: string;

	constructor(id: number, moodName: string, image: Image, valence: string, arousal: string) {
		this.moodId = id
		this.name = moodName;
		this.image = image;
		this.valence = valence;
		this.arousal = arousal;
	}

}