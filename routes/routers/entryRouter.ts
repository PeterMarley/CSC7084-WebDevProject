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

entryRouter.get('/list', async (req: Request, res: Response) => {
    const fetchResponse = await fetch('http://localhost:300/api/mood/entry/94', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
            ...(token && { 'Cookie': 'token=' + token })
        }
    });
    return JSON.parse(await fetchResponse.text());
    res.render('mood-entry-list');
})

entryRouter.get('/new', (req: Request, res: Response) => {
	res.render('mood-entry-new');
})

export default entryRouter;