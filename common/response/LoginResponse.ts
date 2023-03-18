export default class LoginResponse {
    success: boolean;
    token: string | undefined;
    error: Array<string> | undefined;

    constructor(success: boolean, token: string | undefined = undefined, error: Array<string> | undefined = undefined) {
        this.success = success;
        if (token) this.token = token;
        if (error && error.length != 0) this.error = error;
    }
}

