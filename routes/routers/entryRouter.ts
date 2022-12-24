import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { verifyToken } from '../../lib/jwtHelpers';
import authenticate from '../middleware/authenticate';
const entryRouter = express.Router();

entryRouter.use(authenticate);
entryRouter.use(cookieParser())

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    //TODO not a great way of dealing with unauthed requests
    const url = 'http://localhost:3000/api/mood/entry/' + (res.locals.id ? res.locals.id : '');
    const fetchResponse = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
        }
    });

    const body = await fetchResponse.text();
    
    try {
        const json = JSON.parse(body);
        console.dir(json);
        res.locals.entries = json ? json : {};
    } catch {
        res.locals.entries = {};
    }

    res.render('mood-entry-list');
})

entryRouter.get('/new', (req: Request, res: Response) => {
    res.render('mood-entry-new');
})

export default entryRouter;