import cookieParser from 'cookie-parser';
import { Router } from 'express';
import controller from '../controllers/moodController';
import restrictedArea from '../middleware/restrictedArea';

/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

const moodRouter = Router();
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

moodRouter.get('/visual', controller.getVisual);

moodRouter.get('/:entryId', controller.initialiseLocalsForEntryEdit, controller.getEdit);
moodRouter.put('/:entryId', controller.initialiseLocalsForEntryEdit, controller.postEdit);
moodRouter.delete('/:entryId', controller.deleteEntry, controller.getEntryList);



export default moodRouter;