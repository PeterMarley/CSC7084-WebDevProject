const request = require('supertest');
const app = require('../../app');
const jwt = require('../../lib/jwtHelpers');

describe('GET /auth/authed', () => {
  describe('with token cookie', () => {
    test('responds with "true"', async () => {
      const response = await request(app)
        .get('/auth/authed')
        .send().set('Cookie', ['token='+jwt.createToken('username')]);
      // console.dir(response);
      const responseText = response.res.text;
      expect(response.statusCode).toBe(200);
      expect(responseText).toEqual('true');
    });
    // res.locals.authed is false
    // 200 status
  });

  describe.skip('with token cookie - expired', () => {
    // res.locals.authed is false
    // 200 status
  });

  describe.skip('with token cookie - not expired', () => {
    // res.locals.authed is true
    // 200 status
  });
});