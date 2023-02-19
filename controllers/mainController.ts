import { Request, Response } from 'express';
import apiCall from '../utils/apiCall';


function getWelcome(req: Request, res: Response) {
    res.render('welcome');
}

function getTest(req: Request, res: Response) {
    res.render('test');
}

async function getVisual(req: Request, res: Response) {
    if (!res.locals.authed) return;
    
    // const result = await apiCall('GET', '/api/mood/visual/' + res.locals.id);
    //res.locals.data = result;
    // console.log(result.frequencies.mood);

    res.render('visual');
}

const controller = { getTest, getVisual, getWelcome };

export default controller;

