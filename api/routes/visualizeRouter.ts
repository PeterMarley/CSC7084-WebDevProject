/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/visualizeController';
import authenticateRequestByJwt from '../middleware/authenticateRequestByJwt';

const visualizeRouter = express.Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

visualizeRouter.use(authenticateRequestByJwt);

visualizeRouter.get('/moodFrequency', controller.moodFrequency);

//moodRouter.get('/visual/:userId', controller.getVisual);

// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);
// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);
// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);


export default visualizeRouter;