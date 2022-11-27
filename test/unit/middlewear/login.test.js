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

describe('login middlewear units', () => {

  describe('validateLoginRequest -> valid request returns no error messages', () => {
    test('login request valid', () => {
      const validation = validateLoginRequest(new MockExpressRequest(POST, USERNAME, PASSWORD));
      expect(validation).toHaveLength(0);
    });
  });

  describe('validateLoginRequest -> invalid request return appropriate error messages', () => {
    test('login request invalid -> no request method', () => {
      const validation = validateLoginRequest(new MockExpressRequest(undefined, USERNAME, PASSWORD));
      expect(validation).toHaveLength(1);
      expect(validation).toContain('login requires a POST HTTP request but was undefined.');
    });

    test('login request invalid -> invalid request method: GET', () => {
      const validation = validateLoginRequest(new MockExpressRequest(GET, USERNAME, PASSWORD));
      expect(validation).toHaveLength(1);
      expect(validation).toContain('login requires a POST HTTP request but was GET.');
    });

    test('login request invalid -> no username in request body', () => {
      const validation = validateLoginRequest(new MockExpressRequest(POST, undefined, PASSWORD));
      expect(validation).toHaveLength(1);
      expect(validation).toContain('login requires a POST body "username" property.');
    });

    test('login request invalid -> no password in request body', () => {
      const validation = validateLoginRequest(new MockExpressRequest(POST, USERNAME, undefined));
      expect(validation).toHaveLength(1);
      expect(validation).toContain('login requires a POST body "password" property.');
    });

    test('login request invalid -> no request methodpassword in request body', () => {
      const validation = validateLoginRequest(new MockExpressRequest(GET, undefined, undefined));
      expect(validation).toHaveLength(3);
      expect(validation).toContain('login requires a POST body "password" property.');
      expect(validation).toContain('login requires a POST body "username" property.');
      expect(validation).toContain('login requires a POST HTTP request but was GET.');
    });
  });
});