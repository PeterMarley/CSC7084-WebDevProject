import { Request, Response, NextFunction } from "express";
import { LoginResponse } from "../../../models/authResponses";
import login from "../../../routes/middleware/login";

const USERNAME = "testusername123";
const PASSWORD = "testpassword123";
const POST = "POST";
const GET = "GET";
const PUT = 'PUT';

const ERR_MSG_LOGIN_USERNAME =
  'login requires a POST body "username" property.';
const ERR_MSG_LOGIN_PASSWORD =
  'login requires a POST body "password" property.';
const ERR_MSG_LOGIN_METHOD = "login requires a POST HTTP request but was {0}.";

describe("login() middlewear", () => {
  describe("invalid login", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {},
      };
      res = {
        json: jest.fn(),
        cookie: jest.fn(),
        locals: {},
      };
      next = jest.fn()
    });

    test("undefined request type, no username nor password", () => {
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([
          ERR_MSG_LOGIN_METHOD.replace("{0}", "undefined"),
          ERR_MSG_LOGIN_USERNAME,
          ERR_MSG_LOGIN_PASSWORD,
        ])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.locals?.username).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    test("GET request type", () => {
      req.method = GET;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([
          ERR_MSG_LOGIN_METHOD.replace("{0}", GET),
          ERR_MSG_LOGIN_USERNAME,
          ERR_MSG_LOGIN_PASSWORD,
        ])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.locals?.username).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    test("PUT request type", () => {
      req.method = PUT;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([
          ERR_MSG_LOGIN_METHOD.replace("{0}", PUT),
          ERR_MSG_LOGIN_USERNAME,
          ERR_MSG_LOGIN_PASSWORD,
        ])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.locals?.username).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    test("no username", () => {
      req.method = POST;
      req.body.password = PASSWORD;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([
          ERR_MSG_LOGIN_USERNAME,
        ])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.locals?.username).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    test("no password", () => {
      req.method = POST;
      req.body.username = USERNAME;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([
          ERR_MSG_LOGIN_PASSWORD,
        ])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.locals?.username).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('valid login', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        method: POST,
        body: {
          username: USERNAME,
          password: PASSWORD
        },
      };
      res = {
        json: jest.fn(),
        cookie: jest.fn(),
        locals: {},
      };
      next = jest.fn()
    });

    test('login', () => {
      login(req as Request, res as Response, next);
      expect(res.locals?.username).not.toBeUndefined();
    });
  });
});

// function buildRequest(method, username, password) {
//   let req = {};
//   if (method) req.method = method;
//   req.body = {};
//   if (username) req.body.username = username;
//   if (password) req.body.password = password;
//   return req;
// }

// class MockExpressRequest {
//   method;
//   body = {};

//   constructor(method, username, password) {
//     if (method) this.method = method;
//     if (username) this.body.username = username;
//     if (password) this.body.password = password;
//   }
// }

// class MockExpressResponse {
//   jsonCalled = false;
//   sendCalled = false;

//   json(obj) {
//     this.jsonCalled = true;
//     this.responseObj = obj;
//     return this;
//   }

//   send() {
//     this.sendCalled = true;
//     return this;
//   }
// }

// class MockConnectionObject {
//   queryCalled;
//   endCalled;

//   end() {
//     this.endCalled = true;
//   }

//   query(sql, unpwarr, callback) {
//     this.queryCalled = true;
//     callback();
//     // console.log(sql);
//     // console.log(unpwarr);
//     // console.log(callback);
//   }
// }

// describe('checkPassword()', () => {

//   test('testname', () => {
//     let next = false;
//     let query = false;
//     const con = new MockConnectionObject();
//     const res = new MockExpressResponse();
//     const req = new MockExpressRequest('POST', 'DOGS', 'CATS');
//     checkPassword(con, 'hi', req, res,
//       () => {next = true;},
//       () => {query = true;}
//     );
//     function queryy() {
//       query = true;
//     }
//     expect(con.queryCalled).toBe(true);
//     expect(query).toBe(true);
//   });

// });

// describe('validateLoginRequest()', () => {

//   describe('valid login request', () => {

//     describe('valid request returns no error messages', () => {
//       test('login request valid', () => {
//         let response = new MockExpressResponse();
//         const returnBool = validateLoginRequest(new MockExpressRequest(POST, USERNAME, PASSWORD), response);
//         expect(returnBool).toBe(true);
//         expect(response.jsonCalled).toBe(false);
//         expect(response.sendCalled).toBe(false);
//       });
//     });
//   });

//   describe('invalid login request', () => {
//     test('no request method', () => {
//       let response = new MockExpressResponse();
//       const returnBool = validateLoginRequest(new MockExpressRequest(undefined, USERNAME, PASSWORD), response);
//       expect(returnBool).toBe(false);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.jsonCalled).toBe(true);
//     });

//     test('invalid request method: GET', () => {
//       let response = new MockExpressResponse();
//       const returnBool = validateLoginRequest(new MockExpressRequest(GET, USERNAME, PASSWORD), response);
//       expect(returnBool).toBe(false);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.responseObj.err).toContain('login requires a POST HTTP request but was GET.');
//     });

//     test('no username in request body', () => {
//       let response = new MockExpressResponse();
//       const returnBool = validateLoginRequest(new MockExpressRequest(POST, undefined, PASSWORD), response);
//       expect(returnBool).toBe(false);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.responseObj.err).toContain('login requires a POST body "username" property.');
//     });

//     test('no password in request body', () => {
//       let response = new MockExpressResponse();
//       const returnBool = validateLoginRequest(new MockExpressRequest(POST, USERNAME, undefined), response);
//       expect(returnBool).toBe(false);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.responseObj.err).toContain('login requires a POST body "password" property.');
//     });

//     test('no username nor password in request body', () => {
//       let response = new MockExpressResponse();
//       const returnBool = validateLoginRequest(new MockExpressRequest(GET, undefined, undefined), response);
//       expect(returnBool).toBe(false);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.jsonCalled).toBe(true);
//       expect(response.responseObj.err).toContain('login requires a POST body "password" property.');
//       expect(response.responseObj.err).toContain('login requires a POST body "username" property.');
//       expect(response.responseObj.err).toContain('login requires a POST HTTP request but was GET.');
//     });
//   });
// });
