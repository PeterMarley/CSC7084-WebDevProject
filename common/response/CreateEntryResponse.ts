import SuccessResponse from "./SuccessResponse";

export default class CreateEntryResponse extends SuccessResponse {
    entryId: number | undefined;
    constructor(success: boolean, entryId: number | undefined | null = null, errors: string[] | undefined = undefined) {
        super(success, errors);
        if (entryId) this.entryId = entryId;
    }
}