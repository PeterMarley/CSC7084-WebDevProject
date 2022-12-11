import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';

const main = express.Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

main.get('/', (req: Request, res: Response) => {
    res.render('welcome');
});

main.get('/test', (req: Request, res: Response) => {
    res.render('test');
});

main.get('/logout', (req: Request, res: Response) => {
    req.cookies.token = undefined;
    res.clearCookie('token');
    res.statusCode = 200;
    res.redirect('/');
});

main.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

main.post('/login', login);


main.get('/register', (req: Request, res: Response) => {
    res.render('register');
});

main.post('/register', register, login);

main.delete('/deleteuser', async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.confirmation) {
        const r = await apiDeleteUser(req.body.confirmation, req.cookies.token);
        console.log(r);
        console.log(Object.keys(r));
        if (r.success) {
            res.clearCookie('token');
        }
        res.redirect('/');
    }
});

/*******************************************************
 * 
 * MIDDLEWEAR
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
    // console.log('body: ' + body);
    return body;
}

async function register(req: Request, res: Response, next: NextFunction) {
    if (await apiRegisterUser(req.body.username, req.body.email, req.body.password)) {
        next();
    } else {
        res.send('registration failed');
        next('route');
    }
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
    // console.log('body: ' + body);
    return body;
}

async function login(req: Request, res: Response) {
    // const url = 'http://localhost:3000/auth/login';
    // post to /auth/login to get token
    // console.dir(req.body);
    if (!req.body || !req.body.username || !req.body.password) {
        res.statusCode = 401;
        res.send('invalid login post body');
        return;
    } else {
        res.statusCode = 200;
        console.log('---------------------------\nUSERNAME: ' + req.body.username + '\nPASSWORD: ' + req.body.password + '\n---------------------------');

    }

    const { username, password } = req.body;
    const authResponse = await apiCheckPassword(username, password);

    // console.log('---------------------------\nauthResponse: ' + authResponse + '\n---------------------------'); 

    // build response
    if (authResponse.success && authResponse.token) {
        res.cookie('token', authResponse.token);
    }
    //res.set('Content-Type', 'text/html');
    res.redirect(req.body.redirect ? req.body.redirect : '/login');
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
    // console.log('body: ' + body);
    return body;
}

export default main;