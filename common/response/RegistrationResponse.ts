import SuccessResponse from './SuccessResponse';

export default class RegistrationResponse extends SuccessResponse {
    userId: number | undefined;
    constructor(success: boolean, error: string[] | undefined | null = undefined, userId: number | undefined = undefined) {
        super(success, error);
        if (userId) this.userId = userId;
    }
}