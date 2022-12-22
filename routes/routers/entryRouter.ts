import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import authenticate from '../middleware/authenticate';
const entryRouter = express.Router();

entryRouter.use(authenticate);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    const fetchResponse = await fetch('http://localhost:3000/api/mood/entry/94', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
        }
    });
    const body = await fetchResponse.text();
    const json = JSON.parse(body);
    res.locals.entries = json.entries;
    res.render('mood-entry-list');
})

entryRouter.get('/new', (req: Request, res: Response) => {
	res.render('mood-entry-new');
})

export default entryRouter;