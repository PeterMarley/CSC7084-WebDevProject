/******************************
 * 
 * Router Config
 * 
 ******************************/

// express imports
import express, { Request, Response } from 'express';
import authenticateRequestSource from '../../common/authenticateRequestSource';

// app imports
import authAPI from './auth/authApi';
import moodAPI from './mood/moodApi';

// configure express
const api = express.Router();

/******************************
 * 
 * APIs
 * 
 ******************************/

api.use(authenticateRequestSource);

api.use('/auth', authAPI);
api.use('/mood', moodAPI);

// 404 NOT FOUND fallback route
api.all('*', (req: Request, res: Response) => res.status(404).send('that aint no valid API JIMBOB ME SON: ' + req.originalUrl));

export default api;