const express = require('express');
const request = require('supertest');
const authRouter = require('../../routes/authRouter.js');
const cookieParser = require('cookie-parser');
const { URLSearchParams } = require('url');
const {extractToken,extractTokenErrMsg} = require('./helpers/extractToken.js');

const app = express(); 

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/auth', authRouter);

const userCorrect = { username: 'testinguser1', password: 'AEAB42j3rg3$/' };
const userIncorrectPassword = { username: 'testinguser1', password: 'incorrectPassword' };
const userUnknown = { username: 'nonExistantUser', password: 'randomPassword' };

describe('authRouter login', () => {

  describe('successful login', () => {
    const body = new URLSearchParams(userCorrect).toString();

    test('login', async () => {

      const response = await request(app)
        .post('/auth/login')
        .send(body);

      const token = extractToken(response);
      expect(token.username).toBe(userCorrect.username);
      expect(response.statusCode).toBe(302);

    });

  });

  describe('unsuccessful login', () => {
    const bodyIncorrectPassword = new URLSearchParams(userIncorrectPassword).toString();
    const bodyUnknownUser = new URLSearchParams(userUnknown).toString();


    test('login - password wrong', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(bodyIncorrectPassword);

      let error = null;
      try { extractToken(response); } 
      catch(caughtErr) { 
        error = caughtErr;
      }
      
      expect(error).not.toBe(null);
      expect(error.message).toBe(extractTokenErrMsg);
      expect(response.statusCode).toBe(302);

    });

    test('login - username not found', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(bodyUnknownUser);

        let error = null;
        try { extractToken(response); } 
        catch(caughtErr) { 
          error = caughtErr;
        }
        
        expect(error).not.toBe(null);
        expect(error.message).toBe(extractTokenErrMsg);
        expect(response.statusCode).toBe(302);

    });
    

  });
});