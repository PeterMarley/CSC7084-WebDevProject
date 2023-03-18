export default class Image {
	url: string;
	altText: string;

	constructor(imgUrl: string, imgAltText: string) {
		this.url = imgUrl;
		this.altText = imgAltText;
	}
}