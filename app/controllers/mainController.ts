import { Request, Response } from 'express';

class MainController {
    index(req: Request, res: Response) {
        res.render('welcome');
    }

    internalServerError(req: Request, res: Response) {
        res.status(500).render('500');
    }

    forbidden(req: Request, res: Response) {
        res.status(403).render('403');
    }

    notFound(req: Request, res: Response) {
        res.status(404).render('404');
    }
}

export default new MainController();

