/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/visualizeController';
import authorizeRequestByJwt from '../middleware/authorizeRequestByJwt';

const visualizeRouter = express.Router();

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

visualizeRouter.use(authorizeRequestByJwt);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

visualizeRouter.get('/moodFrequency', controller.moodFrequency);
visualizeRouter.get('/arousal', controller.arousal);
visualizeRouter.get('/valence', controller.valence);
visualizeRouter.get('/relationship', controller.relationship);

export default visualizeRouter;