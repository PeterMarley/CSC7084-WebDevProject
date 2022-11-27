const express = require('express');
const request = require('supertest');
const authRouter = require('../../routes/authRouter.js');
const cookieParser = require('cookie-parser');
const { log, dir } = require('console');
const app = express();
const jwt = require('jsonwebtoken');
const { URLSearchParams } = require('url');

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/auth', authRouter);
const body = {username: 'username', password: 'password'};
const urlEncodedBody = new URLSearchParams(body).toString();

describe('authRouter login', () => {
  
  
  test('login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(urlEncodedBody);

    const token = extractToken(response);
    console.dir(token);
    expect(token.username).toBe(body.username);
    // console.dir(response.headers['set-cookie']);
    // console.dir(Object.keys(response.res));
    // console.dir(response.res.text);
    expect(response.statusCode).toBe(302);
  });
});


function extractToken(response) {
  const header = response.get('set-cookie');
  const arr = header[0].split(/[=|;]/).map((i) => i.trim());
  const encodedToken = arr.reduce((acc, cur) => {
    if (acc === true) return cur;
    if (cur === 'token') return true;
    return acc;
  }, false);
  return jwt.verify(encodedToken, process.env.MOODR_TOKEN_SECRET)
}