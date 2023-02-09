import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import controller from '../../controller/mainController';

const mainRouter = Router();

mainRouter.use(authenticate);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.all('/', controller.getWelcome);
mainRouter.get('/test', controller.getTest);
mainRouter.get('/visual', controller.getVisual);

export default mainRouter;