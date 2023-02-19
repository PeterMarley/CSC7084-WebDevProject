import { NextFunction, Request, Response } from "express";
import dao from '../models/daos/mood-dao';

async function moodFrequency(req: Request, res: Response, next: NextFunction) {
    res.json(await dao.getVisualMoodFrequency(res.locals.userId));
}

async function arousal(req: Request, res: Response, next: NextFunction) {
    res.json(await dao.getVisualMoodArousal(res.locals.userId));
}

async function valence(req: Request, res: Response, next: NextFunction) {
    res.json(await dao.getVisualMoodValence(res.locals.userId));
}

async function relationship(req: Request, res: Response, next: NextFunction) {
    res.json(await dao.getVisualRelationship(res.locals.userId));
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

const controller = { moodFrequency, arousal, valence, relationship };

export default controller;