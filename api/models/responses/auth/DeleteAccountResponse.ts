export default class DeleteAccountResponse {
    success: boolean;
    error: string | undefined;
    constructor(success: boolean, error: string | undefined = undefined) {
        this.success = success;
        if (error) this.error = error;
    }
}