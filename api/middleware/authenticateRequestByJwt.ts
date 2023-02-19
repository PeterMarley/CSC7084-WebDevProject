import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from '../../utils/jwtHelpers'

export default function authenticateRequestByJwt(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    console.log('authenticateRequestByJwt\n\t[token is ' + authHeader + ']');
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