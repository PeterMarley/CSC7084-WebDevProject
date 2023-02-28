import express, { NextFunction, Request, Response } from 'express';

const fallbackRouter = express.Router();

fallbackRouter.all('/500', (req: Request, res: Response) =>  res.status(500).send('big fat 500: ' + req.originalUrl));
fallbackRouter.all('/forbidden', (req: Request, res: Response) => res.render('forbidden'));
fallbackRouter.all('*', (req: Request, res: Response) => res.status(404).render('404'));

export default fallbackRouter;