import { Request, Response } from 'express';
import apiCall from '../utils/apiCall';


function getWelcome(req: Request, res: Response) {
    res.render('welcome');
}

function getTest(req: Request, res: Response) {
    res.render('test');
}

async function getVisual(req: Request, res: Response) {
    console.log('http://localhost:3000/api/mood/visual/' + res.locals.id);
    const result = await apiCall('GET', 'http://localhost:3000/api/mood/visual/' + res.locals.id);
    res.locals.data = result;
    console.log(result);

    res.render('visual');
}

const controller = { getTest, getVisual, getWelcome };

export default controller;

