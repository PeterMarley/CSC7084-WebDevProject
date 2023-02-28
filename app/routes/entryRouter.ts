import cookieParser from 'cookie-parser';
import { Router } from 'express';
import controller from '../controllers/entryController';
import { authenticate, restrictedArea } from '../middleware/authenticate';

const entryRouter = Router();
entryRouter.use(restrictedArea);
entryRouter.use(cookieParser());

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', restrictedArea, controller.getEntryList);

entryRouter.get('/new', restrictedArea, controller.getNewEntryForm);
entryRouter.post('/new', restrictedArea, controller.createNewEntry);

entryRouter.get('/edit/:entryId', restrictedArea, controller.initialiseLocalsForEntryEdit, controller.getEdit);
entryRouter.post('/edit/:entryId', restrictedArea, controller.initialiseLocalsForEntryEdit, controller.postEdit);

entryRouter.get('/delete/:entryId', restrictedArea, controller.deleteEntry, controller.getEntryList);

entryRouter.get('/activity', restrictedArea, controller.getActivity);

export default entryRouter;