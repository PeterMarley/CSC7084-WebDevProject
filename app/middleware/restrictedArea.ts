import { Request, Response, NextFunction } from 'express';

export default function restrictedArea(req: Request, res: Response, next: NextFunction) {
    if (!res.locals.authed) {
        res.status(403).render('forbidden');
        return;
    }
    next();
}