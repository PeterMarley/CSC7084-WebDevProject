import { Request, Response, NextFunction } from "express";

/**
 * Express Middleware: Allows only authorized calls to this API.
 */
export default function authenticateRequestSource(req: Request, res: Response, next: NextFunction) {
    if (req.get('Authorization') !== 'Bearer ' + process.env.REQUESTOR) {
        res.statusCode = 401;
        res.send({ error: 'You are not authorized.' })
        return;
    }
    next();
}