export default class LoginResponse {
    success: boolean;
    token: string | null = null;

    constructor(success: boolean, token: string | null) {
        this.success = success;
        if (token) this.token = token;
    }
}

