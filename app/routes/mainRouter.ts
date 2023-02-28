import { Router } from 'express';
import { restrictedArea } from '../middleware/authenticate';
import controller from '../controllers/mainController';

const mainRouter = Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.get('/', controller.getWelcome);
mainRouter.get('/test', restrictedArea, controller.getTest);
mainRouter.get('/visual', restrictedArea, controller.getVisual);

export default mainRouter;