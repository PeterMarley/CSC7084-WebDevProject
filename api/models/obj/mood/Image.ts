import IImage from '../../../../common/model/IImage'


export default class Image implements IImage {
	url: string;
	altText: string;

	constructor(imgUrl: string, imgAltText: string) {
		this.url = imgUrl;
		this.altText = imgAltText;
	}
}