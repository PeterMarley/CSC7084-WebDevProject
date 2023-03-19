import SuccessResponse from "./SuccessResponse";

export default class AccountDetailsUpdateResponse extends SuccessResponse {
    userId: number;
    username: string;
    email: string;
    constructor(success: boolean, userId: number, username: string, email: string) {
        super(success);
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}