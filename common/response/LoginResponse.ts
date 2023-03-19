import SuccessResponse from './SuccessResponse';

export default class LoginResponse extends SuccessResponse {
    token: string | undefined;
    constructor(success: boolean, token: string | undefined | null = null, error: string[] | undefined | null = null) {
        super(success, error);
        if (token) this.token = token;
    }
}

