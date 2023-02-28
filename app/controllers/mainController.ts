import { Request, Response } from 'express';
import apiCall from '../utils/apiCall';

class MainController {
    getWelcome(req: Request, res: Response) {      
        res.render('welcome');
    }
    getTest(req: Request, res: Response) {
        res.render('test');
    }
    async getVisual(req: Request, res: Response) {
        if (!res.locals.authed) {
            res.status(401).json({ success: false, message: "Not Authorized" })
            return;
        }
        res.render('visual');
    }
}

export default new MainController();

