import express, { Request, Response, NextFunction } from 'express';
import authenticate from '../middleware/authenticate';
const entryRouter = express.Router();

entryRouter.use(authenticate);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', (req: Request, res: Response) => {
    res.render('mood-entry-list');
})

entryRouter.get('/new', (req: Request, res: Response) => {
	res.render('mood-entry-new');
})

export default entryRouter;