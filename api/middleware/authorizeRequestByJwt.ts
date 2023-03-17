import { NextFunction, Request, Response } from "express";
import { verifyToken } from '../../app/utils/jwtHelpers'

export default function authorizeRequestByJwt(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    let userId: number;
    try {
        const payload = verifyToken(authHeader);
        userId = payload.id
    } catch (err: any) {
        console.log(err.message);
        res.status(401).json({status: "failed", message: "Not Authorized"});
        return;
    }

    res.locals.userId = userId;

    next();
}