import { Request, Response, NextFunction } from "express";
import { format, RowDataPacket } from "mysql2";
import SuccessResponse from "../models/responses/SuccessResponse";
import getConnection from '../utils/dbConnection';

/**
 * Express Middleware: Allows only authorized calls to this API.
 */
export default async function authenticateRequestSource(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization') ?? '';
    
    const con = await getConnection();
    const sql = format("SELECT COUNT(*) AS `count` FROM tbl_key k WHERE k.api_key=? AND k.active=1", [authHeader]);
    const result = (await con.query(sql)).at(0) as RowDataPacket;
    con.end();

    const count = result[0].count;
    if (count < 1) {
        res.statusCode = 401;
        res.send(new SuccessResponse(false, ['You are not authorized.']));
        return;
    }
    next();
}