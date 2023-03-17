import cookieParser from 'cookie-parser';
import { Router } from 'express';
import controller from '../controllers/entryController';
import { restrictedArea } from '../middleware/authorize';

/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

const moodRouter = Router();
moodRouter.use(restrictedArea);
moodRouter.use(cookieParser());
moodRouter.use(restrictedArea);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

moodRouter.get('/list', controller.getEntryList);

moodRouter.get('/new', controller.getNewEntryForm);
moodRouter.post('/new', controller.createNewEntry);

moodRouter.get('/edit/:entryId', controller.initialiseLocalsForEntryEdit, controller.getEdit);
moodRouter.post('/edit/:entryId', controller.initialiseLocalsForEntryEdit, controller.postEdit);

moodRouter.get('/delete/:entryId', controller.deleteEntry, controller.getEntryList);

moodRouter.get('/activity', controller.getActivity);

moodRouter.get('/visual', controller.getVisual);

export default moodRouter;