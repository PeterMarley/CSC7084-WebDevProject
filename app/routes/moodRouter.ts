import cookieParser from 'cookie-parser';
import { Router } from 'express';
import controller from '../controllers/entryController';
import { authenticate, restrictedArea } from '../middleware/authenticate';

const moodRouter = Router();
moodRouter.use(restrictedArea);
moodRouter.use(cookieParser());

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

moodRouter.get('/list', restrictedArea, controller.getEntryList);

moodRouter.get('/new', restrictedArea, controller.getNewEntryForm);
moodRouter.post('/new', restrictedArea, controller.createNewEntry);

moodRouter.get('/edit/:entryId', restrictedArea, controller.initialiseLocalsForEntryEdit, controller.getEdit);
moodRouter.post('/edit/:entryId', restrictedArea, controller.initialiseLocalsForEntryEdit, controller.postEdit);

moodRouter.get('/delete/:entryId', restrictedArea, controller.deleteEntry, controller.getEntryList);

moodRouter.get('/activity', restrictedArea, controller.getActivity);

moodRouter.get('/visual', restrictedArea, controller.getVisual);

export default moodRouter;