
export class AccountDetailsUpdateResponse {
    success: boolean;
    userId: number;
    username: string;
    email: string;

    constructor(success: boolean, userId: number, username: string, email: string) {
        this.success = success;
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}

export class AccountPasswordUpdateResponse {
    success: boolean;

    constructor(success: boolean) {
        this.success = success;
    }
}

export class AccountDetailsGetResponse {
    username: string;
    email: string;

    constructor(username: string, email: string) {
        this.email = email;
        this.username = username;
    }
}

export class LoginResponse {
    success: boolean;
    token: string;

    constructor(success: boolean, token: string) {
        this.success = success;
        this.token = token;
    }
}