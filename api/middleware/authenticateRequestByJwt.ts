import { NextFunction, Request, Response } from "express";
import { verifyToken } from '../../utils/jwtHelpers'

export default function authenticateRequestByJwt(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    console.log('authenticateRequestByJwt\n\t[token is ' + authHeader + ']');
    let userId: object;
    try {
        userId = verifyToken(authHeader).id
    } catch (err) {
        console.log(err);
        res.status(401).json({status: "failed", message: "Not Authorized"});
        return;
    }

    res.locals.userId = userId;

    next();
}