import { NextFunction, Request, Response } from "express";
import config from '../../config/Config';

export default function injectConfig(req: Request, res: Response, next: NextFunction) {
    res.locals.config = config;
    next();
}