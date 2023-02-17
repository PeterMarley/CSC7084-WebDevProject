import { NextFunction, Request, Response } from "express";
import dao from '../models/daos/mood-dao';

async function moodFrequency(req: Request, res: Response, next: NextFunction) {
    
    console.log(await dao.getVisual(res.locals.userId));
    res.json({"status": "not implemented"});
}

// async function getVisual(req: Request, res: Response) {
// 	const userId = Number(req.params.userId);

// 	if (!userId) {
// 		res.status(400).json(new SuccessResponse(false, ['userId parameter was not a number']));
// 		return;
// 	}

// 	const result = await dao.getVisual(userId);
// 	// console.log(result);
// 	res.json(result);
// }

const controller = { moodFrequency };

export default controller;