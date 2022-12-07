export default class LoginResponse {
    success: boolean;
    token: string | undefined;

    constructor(success: boolean, token: string | undefined) {
        this.success = success;
        if (token) this.token = token;
    }
}
