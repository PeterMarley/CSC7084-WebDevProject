import { NextFunction, Request, Response } from "express";
import logErrors from "../../common/utils/logError";
import SuccessResponse from "../../common/response/SuccessResponse";

export default function internalServerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logErrors([err]);
    // as per ExpressJS documentation, if response headers have been sent, then the default error hander
    // must be invoked by passing the error as a parameter to the next() function
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json(new SuccessResponse(false, ['Internal Server Error']));
    return;
}