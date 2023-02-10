export default class AccountDetailsUpdateResponse {
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