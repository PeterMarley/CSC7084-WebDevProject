import express, { Request, Response } from 'express';

const fallbackRouter = express.Router();

fallbackRouter.all('/500', (req: Request, res: Response) =>  res.status(500).send('big fat 500: ' + req.originalUrl));
fallbackRouter.all('*', (req: Request, res: Response) => res.status(404).send('that aint no valid route SONNY JIM MBOY: ' + req.originalUrl));

export default fallbackRouter;