import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
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
        const r = await apiDeleteUser(req.body.confirmation, req.cookies.token);
        res.clearCookie('token');
        res.redirect(302, '/');
    }
}

async function registerPost(req: Request, res: Response, next: NextFunction) {
    if (await apiRegisterUser(req.body.username, req.body.email, req.body.password)) {
        next();
    } else {
        res.send('registration failed');
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
    const authResponse = await apiCheckPassword(username, password);


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

async function apiDeleteUser(confirmation: boolean, token: string) {
    const url = 'http://localhost:3000/auth/deleteuser';
    const fetchResponse = await fetch(url, {
        method: 'DELETE',
        body: new URLSearchParams([['confirmation', confirmation ? 'true' : 'false']]),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
            'Cookie': 'token=' + token,
        }
    });
    const body = JSON.parse(await fetchResponse.text());
    return body;
}

async function apiRegisterUser(username: string, email: string, password: string) {
    const url = 'http://localhost:3000/auth/register';
    const fetchResponse = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams([['username', username], ['email', email], ['password', password]]),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
        }
    });
    const body = JSON.parse(await fetchResponse.text()).success;
    return body;
}

async function apiCheckPassword(username: string, password: string) {
    const url = 'http://localhost:3000/auth/login';
    const fetchResponse = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams([['username', username], ['password', password]]),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.REQUESTOR,
        }
    });
    const body = JSON.parse(await fetchResponse.text());
    return body;
}

export default userRouter;