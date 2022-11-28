const { validateLoginRequest } = require('../../../routes/middleware/login.js');

const USERNAME = 'testusername123';
const PASSWORD = 'testpassword123';
const POST = 'POST';
const GET = 'GET';

function buildRequest(method, username, password) {
  let req = {};
  if (method) req.method = method;
  req.body = {};
  if (username) req.body.username = username;
  if (password) req.body.password = password;
  return req;
}

class MockExpressRequest {
  method;
  body = {};

  constructor(method, username, password) {
    if (method) this.method = method;
    if (username) this.body.username = username;
    if (password) this.body.password = password;
  }
}

describe('validateLoginRequest()', () => {
  describe('valid', () => {

    describe('valid request returns no error messages', () => {
      test('login request valid', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(POST, USERNAME, PASSWORD));
        expect(errorMsgs).toHaveLength(0);
      });
    });
  });

  describe('invalid', () => {
    describe('invalid request return appropriate error messages', () => {
      test('login request invalid -> no request method', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(undefined, USERNAME, PASSWORD));
        expect(errorMsgs).toHaveLength(1);
        expect(errorMsgs).toContain('login requires a POST HTTP request but was undefined.');
      });

      test('invalid request method: GET', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(GET, USERNAME, PASSWORD));
        expect(errorMsgs).toHaveLength(1);
        expect(errorMsgs).toContain('login requires a POST HTTP request but was GET.');
      });

      test('no username in request body', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(POST, undefined, PASSWORD));
        expect(errorMsgs).toHaveLength(1);
        expect(errorMsgs).toContain('login requires a POST body "username" property.');
      });

      test('no password in request body', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(POST, USERNAME, undefined));
        expect(errorMsgs).toHaveLength(1);
        expect(errorMsgs).toContain('login requires a POST body "password" property.');
      });

      test('no request methodpassword in request body', () => {
        const errorMsgs = validateLoginRequest(new MockExpressRequest(GET, undefined, undefined));
        expect(errorMsgs).toHaveLength(3);
        expect(errorMsgs).toContain('login requires a POST body "password" property.');
        expect(errorMsgs).toContain('login requires a POST body "username" property.');
        expect(errorMsgs).toContain('login requires a POST HTTP request but was GET.');
      });
    });
  });
});