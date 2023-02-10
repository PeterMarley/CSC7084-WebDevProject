export default class PasswordQueryResponse {
	id: number;
	passwordFromDb: string;
	email: string;

	constructor(id: number, password: string, email: string) {
			this.id = id;
			this.passwordFromDb = password;
			this.email = email;
	}
}