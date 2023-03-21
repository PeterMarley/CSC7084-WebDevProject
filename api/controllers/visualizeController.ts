import { NextFunction, Request, Response } from "express";
import logErrors from "../../common/utils/logError";
import dao from '../database/mood-dao';

async function moodFrequency(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await dao.getVisualMoodFrequency(res.locals.userId));
    } catch (err: any) {
        logErrors([err]);
        next(err);
    }
}

async function arousal(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await dao.getVisualMoodArousal(res.locals.userId));
    } catch (err: any) {
        logErrors([err]);
        next(err);
    }
}

async function valence(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await dao.getVisualMoodValence(res.locals.userId));
    } catch (err: any) {
        logErrors([err]);
        next(err);
    }
}

async function relationship(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await dao.getVisualRelationship(res.locals.userId));
    } catch (err: any) {
        logErrors([err]);
        next(err);
    }
}

async function summary(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await dao.getVisualSummary(res.locals.userId));
    } catch (err: any) {
        logErrors([err]);
        next(err);
    }
}

const controller = { moodFrequency, arousal, valence, relationship, summary };

export default controller;