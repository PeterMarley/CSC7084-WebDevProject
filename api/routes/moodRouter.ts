/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/moodController';
import authorizeRequestSource from '../middleware/authorizeRequestSource';

const moodRouter = express.Router();

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

moodRouter.use(authorizeRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

moodRouter.put('/:userId/context/:activityId', controller.updateContext)
moodRouter.post('/:userId/context/', controller.createContext)

moodRouter.get('/:userId/new', controller.getEntryFormData)
moodRouter.post('/:userId/new', controller.createNewEntry);

moodRouter.get('/:userId/list', controller.getEntryList);

moodRouter.get('/:userId/:entryId', controller.getEntryFormData, controller.getSingleEntry);
moodRouter.put('/:userId/:entryId', controller.updateSingleEntry);
moodRouter.delete('/:userId/:entryId', controller.deleteSingleEntry);

export default moodRouter;