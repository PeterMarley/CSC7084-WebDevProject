/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/moodController';
import authenticateRequestSource from '../middleware/authenticateRequestSource';

const moodRouter = express.Router();

// moodAPI.use(express.urlencoded({ extended: false }));

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

moodRouter.use(authenticateRequestSource);

const ENTRY_ROUTE = '/entry';

moodRouter.get(ENTRY_ROUTE + '/new/:userId', controller.getEntryFormData)
moodRouter.post(ENTRY_ROUTE + '/new/:userId', controller.createNewEntry);

moodRouter.get(ENTRY_ROUTE + '/list/:userId', controller.getEntryList);

const entryOperationsRoute = ENTRY_ROUTE + '/:userId/:entryId';
moodRouter.get(entryOperationsRoute, controller.getEntryFormData, controller.getSingleEntry);
moodRouter.put(entryOperationsRoute, controller.updateSingleEntry);
moodRouter.delete(entryOperationsRoute, controller.deleteSingleEntry);

export default moodRouter;