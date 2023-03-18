import IImage from "../../../../common/model/IImage";
import IMood from '../../../../common/model/IMood'

export default class Mood implements IMood {
	moodId: number;
	name: string;
	image: IImage;
	valence: string;
	arousal: string;

	constructor(id: number, moodName: string, image: IImage, valence: string, arousal: string) {
		this.moodId = id
		this.name = moodName;
		this.image = image;
		this.valence = valence;
		this.arousal = arousal;
	}
}