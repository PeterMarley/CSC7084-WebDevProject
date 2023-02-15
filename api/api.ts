/******************************
 * 
 * Router Config
 * 
 ******************************/

// express imports
import express, { Request, Response } from 'express';
import authenticateRequestSource from './middleware/authenticateRequestSource';

// app imports
import authRouter from './routes/authRouter';
import moodRouter from './routes/moodRouter';

// configure express
const api = express.Router();

/******************************
 * 
 * APIs
 * 
 ******************************/

api.use(authenticateRequestSource);
api.use(express.urlencoded({ extended: false }));

api.use('/auth', authRouter);
api.use('/mood', moodRouter);

// 404 NOT FOUND fallback route
api.all('*', (req: Request, res: Response) => res.status(404).send('that aint no valid API JIMBOB ME SON: ' + req.originalUrl));

export default api;