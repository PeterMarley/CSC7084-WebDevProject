import { Request, Response } from 'express';

class MainController {
    getWelcome(req: Request, res: Response) {
        res.render('welcome');
    }
    getTest(req: Request, res: Response) {
        res.render('test');
    }
    internalServerError(req: Request, res: Response) {
        res.status(500).send('big fat 500: ' + req.originalUrl);
    }
    forbidden(req: Request, res: Response) {
        res.render('forbidden');
    }
    notFound(req: Request, res: Response) {
        res.status(404).render('404');
    }
    test(req: Request, res: Response) {
        throw new Error('test error');
    }
}

export default new MainController();

