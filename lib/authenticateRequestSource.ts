import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../routes/api/mood/moodApiModel";

/**
 * Express Middleware: Allows only authorized calls to this API.
 */
export default function authenticateRequestSource(req: Request, res: Response, next: NextFunction) {
    if (req.get('Authorization') !== 'Bearer ' + process.env.REQUESTOR) {
        res.statusCode = 401;
        res.send(new SuccessResponse(false, ['You are not authorized.']));
        return;
    }
    next();
}