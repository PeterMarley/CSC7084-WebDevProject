export default class SuccessResponse {
	success: boolean;
	errors: string[] | undefined | null;

	constructor(success: boolean, errors: string[] | undefined | null = null) {
		this.success = success;
		if (errors && errors.length > 0) this.errors = errors;
	}
}