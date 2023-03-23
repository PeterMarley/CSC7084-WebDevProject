/******************************
 * 
 * Router Config
 * 
 ******************************/

// express imports
import express, { Request, Response } from 'express';
import internalServerErrorHandler from './middleware/internalServerErrorHandler';


// app imports
import userRouter from './routes/userRouter';
import moodRouter from './routes/moodRouter';
import visualizeRouter from './routes/visualizeRouter';
import SuccessResponse from '../common/response/SuccessResponse';

// configure express
const api = express.Router();

/******************************
 * 
 * Routes
 * 
 ******************************/

api.use(express.urlencoded({ extended: false }));

api.use('/user', userRouter);
api.use('/mood', moodRouter);
api.use('/visualize', visualizeRouter);

/******************************
 * 
 * Error Handlers
 * 
 ******************************/

api.use(internalServerErrorHandler);

// 404 NOT FOUND fallback route
api.all('*', (req: Request, res: Response) => {
    res.status(404).json(new SuccessResponse(false, ['Route not recognised: ' + req.originalUrl]));
});

export default api;