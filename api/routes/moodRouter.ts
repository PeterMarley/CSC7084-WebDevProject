/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/moodController';
import authenticateRequestSource from '../middleware/authenticateRequestSource';

const moodRouter = express.Router();

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

moodRouter.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/


moodRouter.get('/new/:userId', controller.getEntryFormData)
moodRouter.post('/new/:userId', controller.createNewEntry);

moodRouter.get('/list/:userId', controller.getEntryList);

moodRouter.get('/:userId/:entryId', controller.getEntryFormData, controller.getSingleEntry);
moodRouter.put('/:userId/:entryId', controller.updateSingleEntry);
moodRouter.delete('/:userId/:entryId', controller.deleteSingleEntry);

export default moodRouter;