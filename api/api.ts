/******************************
 * 
 * Router Config
 * 
 ******************************/

// express imports
import express, { Request, Response } from 'express';
import internalServerErrorHandler from './middleware/internalServerErrorHandler';


// app imports
import authRouter from './routes/authRouter';
import moodRouter from './routes/moodRouter';
import visualizeRouter from './routes/visualizeRouter';

// configure express
const api = express.Router();

/******************************
 * 
 * Routes
 * 
 ******************************/

api.use(express.urlencoded({ extended: false }));

api.use('/auth', authRouter);
api.use('/mood', moodRouter);
api.use('/visualize', visualizeRouter);

/******************************
 * 
 * Error Handlers
 * 
 ******************************/

api.use(internalServerErrorHandler);

// 404 NOT FOUND fallback route
api.all('*', (req: Request, res: Response) => res.status(404).send('that aint no valid API JIMBOB ME SON: ' + req.originalUrl));

export default api;