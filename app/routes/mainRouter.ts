import { Router } from 'express';
import controller from '../controllers/mainController';

const mainRouter = Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.get('/', controller.getWelcome);

mainRouter.all('/500', controller.internalServerError);
mainRouter.all('/forbidden', controller.forbidden);
mainRouter.all('*', controller.notFound);

export default mainRouter;