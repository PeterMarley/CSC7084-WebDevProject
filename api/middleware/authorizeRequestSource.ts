import { Request, Response, NextFunction } from "express";
import { format, RowDataPacket } from "mysql2";
import SuccessResponse from "../../common/response/SuccessResponse";
import getConnection from '../utils/dbConnection';

/**
 * Express Middleware: Allows only authorized calls to this API.
 */
export default async function authorizeRequestSource(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    let count = 0;
    try {
        const con = await getConnection();
        const sql = format("SELECT COUNT(*) AS `count` FROM tbl_key k WHERE k.api_key=? AND k.active=1", [authHeader]);
        const result = (await con.query(sql)).at(0) as RowDataPacket;
        con.end();
        count = result[0].count;
    } catch (err: any) {
        res.status(500).send(new SuccessResponse(false, ['Internal Server Error.']));
        return;
    }

    if (count < 1) {
        res.status(401).send(new SuccessResponse(false, ['You are not authorized.']));
        return;
    }
    next();
}