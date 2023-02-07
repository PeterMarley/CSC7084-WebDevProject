import express, { Request, Response, NextFunction } from 'express';
import apiCall from '../../lib/apiCall';
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

mainRouter.get('/visual', async (req: Request, res: Response) => {
    console.log('http://localhost:3000/api/mood/visual/' + res.locals.id);
    const result = await apiCall('GET','http://localhost:3000/api/mood/visual/' + res.locals.id);
    res.locals.data = result;
    console.log(result);
    
    res.render('visual');
});

export default mainRouter;