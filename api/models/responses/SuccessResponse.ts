export default class SuccessResponse {
	success: boolean;
	errors?: string[];

	constructor(success: boolean, errors: string[] | undefined = undefined) {
		this.success = success;
		if (errors && errors.length > 0) this.errors = errors;
	}
}