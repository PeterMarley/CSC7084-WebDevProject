import express, { Request, Response, NextFunction } from 'express';
import authenticate from '../middleware/authenticate';
const mainRouter = express.Router();

mainRouter.use(authenticate);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.all('/', (req: Request, res: Response) => {
    res.render('welcome');
});

mainRouter.get('/test', (req: Request, res: Response) => {
    res.render('test');
});

export default mainRouter;