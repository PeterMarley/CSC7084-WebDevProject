import express, { Request, Response, NextFunction } from 'express';
import fetch, { RequestInit, HeaderInit } from 'node-fetch';
import RegistrationResponse from '../../models/RegistrationResponse';
const userRouter = express.Router();

// log out

userRouter.get('/logout', logoutGet);

// log in

userRouter.get('/login', loginGet);

userRouter.post('/login', loginPost);

// register

userRouter.get('/register', registerGet);

userRouter.post('/register', registerPost, loginPost);

// delete account

userRouter.delete('/deleteuser', deleteUser);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

function registerGet(req: Request, res: Response) {
    res.render('register');
}

function loginGet(req: Request, res: Response) {
    res.render('login');
}

function logoutGet(req: Request, res: Response) {
    req.cookies.token = undefined;
    res.clearCookie('token');
    res.statusCode = 200;
    res.redirect('/');
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
    if (req.body.confirmation) {
        await apiCall(
            'DELETE',
            'http://localhost:3000/auth/deleteuser',
            new URLSearchParams([['confirmation', req.body.confirmation ? 'true' : 'false']]),
            req.cookies.token
        );
        res.clearCookie('token');
        res.redirect(302, '/');
    }
}

async function registerPost(req: Request, res: Response, next: NextFunction) {
    const registrationResponse: RegistrationResponse = await apiCall(
        'POST', 
        'http://localhost:3000/auth/register', 
        new URLSearchParams([['username', req.body.username], ['email', req.body.email], ['password', req.body.password]])
    );
    if (registrationResponse.success) {
        next();
    } else {
        res.send(registrationResponse.error); //TODO return an actual page
        next('route');
    }
}

async function loginPost(req: Request, res: Response) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.statusCode = 401;
        res.send('invalid login post body');
        return;
    } else {
        res.statusCode = 200;
    }

    const { username, password } = req.body;
    //const authResponse = await apiCheckPassword(username, password);
    const authResponse = await apiCall(
        'POST',
        'http://localhost:3000/auth/login',
        new URLSearchParams([['username', username], ['password', password]])
    );


    // build response
    if (authResponse.success && authResponse.token) {
        res.cookie('token', authResponse.token);
    }
    res.redirect(req.body.redirect ? req.body.redirect : '/login');
}

/*******************************************************
 * 
 * API CALLING FUNCTIONS
 * 
 *******************************************************/

async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE', url: string, body: URLSearchParams, token: string | undefined = undefined) {
    const fetchResponse = await fetch(url, {
        method: httpMethod,
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
            ...(token && { 'Cookie': 'token=' + token })
        }
    });
    return JSON.parse(await fetchResponse.text());
}

export default userRouter;