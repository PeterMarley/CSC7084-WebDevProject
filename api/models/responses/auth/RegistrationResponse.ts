export default class RegistrationResponse {
    success: boolean;
    error: string[] | undefined;
    constructor(success: boolean, error: string[] | undefined = undefined) {
        this.success = success;
        if (error && error.length !== 0) this.error = error;
    }
}