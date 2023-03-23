import { NextFunction, Request, Response } from "express";
import SuccessResponse from "../../common/response/SuccessResponse";
import { verifyToken } from '../../common/utils/jwtHelpers'

export default function authorizeRequestByJwt(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    let userId: number;
    try {
        const payload = verifyToken(authHeader);
        if (payload.expiry <= Date.now()) throw '';
        userId = payload.id
    } catch (err: any) {
        res.status(401).json(new SuccessResponse(false, ['You are not authorized.']));
        return;
    }

    res.locals.userId = userId;

    next();
}