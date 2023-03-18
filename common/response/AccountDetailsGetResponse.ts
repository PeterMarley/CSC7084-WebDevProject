export default class AccountDetailsGetResponse {
    username: string;
    email: string;

    constructor(username: string, email: string) {
        this.email = email;
        this.username = username;
    }
}