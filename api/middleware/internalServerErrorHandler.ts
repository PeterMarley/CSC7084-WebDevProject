import { NextFunction, Request, Response } from "express";
import SuccessResponse from "../models/responses/SuccessResponse";

export default function internalServerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    res.status(500).json(new SuccessResponse(false, ['Internal Server Error']));
    return;
}