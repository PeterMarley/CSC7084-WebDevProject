import cookieParser from 'cookie-parser';
import { Router } from 'express';
import controller from '../../controller/entryController';
import authenticate from '../middleware/authenticate';

const entryRouter = Router();
entryRouter.use(authenticate);
entryRouter.use(cookieParser());

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

entryRouter.get('/list', controller.getEntryList);

entryRouter.get('/new', controller.getNewEntryForm);
entryRouter.post('/new', controller.createNewEntry);

entryRouter.get('/edit/:entryId', controller.initialiseLocalsForEntryEdit, controller.getEdit);
entryRouter.post('/edit/:entryId', controller.initialiseLocalsForEntryEdit, controller.postEdit);

entryRouter.get('/delete/:entryId', controller.deleteEntry, controller.getEntryList);

entryRouter.get('/activity', controller.getActivity);

export default entryRouter;