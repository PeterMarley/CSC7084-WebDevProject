export default class RegistrationResponse {
    success: boolean;
    error: string[] | undefined;
    userId: number | undefined;
    constructor(success: boolean, error: string[] | undefined | null = undefined, userId: number | undefined = undefined) {
        this.success = success;
        if (error && error.length !== 0) this.error = error;
        if (userId) this.userId = userId;
    }
}