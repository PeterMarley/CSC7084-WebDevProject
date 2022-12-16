import express, { Request, Response, NextFunction } from 'express';
import authenticate from '../middleware/authenticate';
const mainRouter = express.Router();

mainRouter.use(authenticate);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.get('/', (req: Request, res: Response) => {
    res.render('welcome');
});

mainRouter.get('/test', (req: Request, res: Response) => {
    res.render('test');
});

mainRouter.get('/entry', (req: Request, res: Response) => {
    
    
    res.render('mood-entry');
})

export default mainRouter;