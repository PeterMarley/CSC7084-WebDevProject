import { Router } from 'express';
import controller from '../controllers/mainController';

/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

const mainRouter = Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

mainRouter.get('/', controller.index);

// Fallback routes
mainRouter.all('/error', controller.internalServerError);
mainRouter.all('/forbidden', controller.forbidden);
mainRouter.all('*', controller.notFound);

export default mainRouter;