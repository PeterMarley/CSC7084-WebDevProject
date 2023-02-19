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
visualizeRouter.get('/arousal', controller.arousal);
visualizeRouter.get('/valence', controller.valence);
visualizeRouter.get('/relationship', controller.relationship);


//moodRouter.get('/visual/:userId', controller.getVisual);

// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);
// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);
// visualizeRouter.get('/:userId/moodFreq', controller.getEntryFormData);


export default visualizeRouter;