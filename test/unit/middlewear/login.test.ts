import { Request, Response, NextFunction } from "express";
import { LoginResponse } from "../../../models/authResponses";
import login, { authenticateLogin } from "../../../routes/middleware/login";
import mysql from "mysql";
import * as dotenv from 'dotenv';
dotenv.config();

const USERNAME: string = process.env.MOODR_TEST_USER_USERNAME!;
const PASSWORD: string = process.env.MOODR_TEST_USER_PASSWORD!;
const POST: string = "POST";
const GET: string = "GET";
const PUT: string = "PUT";

const ERR_MSG_LOGIN_USERNAME: string =
  'login requires a POST body "username" property.';
const ERR_MSG_LOGIN_PASSWORD: string =
  'login requires a POST body "password" property.';
const ERR_MSG_LOGIN_METHOD: string =
  "login requires a POST HTTP request but was {0}.";

describe("login middlewear", () => {
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
      next = jest.fn();
    });

    test("undefined request type, no username nor password gets json error response", () => {
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
      expect(next).not.toHaveBeenCalled();
    });

    test("GET request type gets json error response", () => {
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
      expect(next).not.toHaveBeenCalled();
    });

    test("PUT request type gets json error response", () => {
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
      expect(next).not.toHaveBeenCalled();
    });

    test("no username gets json error response", () => {
      req.method = POST;
      req.body.password = PASSWORD;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([ERR_MSG_LOGIN_USERNAME])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("no password gets json error response", () => {
      req.method = POST;
      req.body.username = USERNAME;
      login(req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toBeCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        new LoginResponse([ERR_MSG_LOGIN_PASSWORD])
      );
      expect(res.cookie).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("valid login", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    let connect: Partial<mysql.Connection>;
    let query: Partial<mysql.queryCallback>;
    let getConFunc;

    beforeEach(() => {
      req = {
        method: POST,
        body: {
          username: USERNAME,
          password: PASSWORD,
        },
      };
      res = {
        json: jest.fn(),
        cookie: jest.fn(),
        locals: {
          username: undefined,
        },
      };
      next = jest.fn();
      query = jest.fn((sql: string, options: any, callback: mysql.queryCallback) => callback(null, [{ passwordCorrect: 1 }], undefined));
      connect = {
        query: query as mysql.QueryFunction,
        end: jest.fn(),
      };
      getConFunc = jest.fn(() => connect as mysql.Connection);
    });

    test("login", () => {
      login(req as Request, res as Response, next, getConFunc);

      expect(getConFunc).toHaveBeenCalledTimes(1);
      expect(connect.query).toHaveBeenCalledTimes(1);
      expect(connect.end).toHaveBeenCalledTimes(1);
      expect(res.locals?.username).toBe(USERNAME);
      expect(res.locals?.authed).toBe(true);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledWith("token", expect.stringContaining("."));
    });
  });
});

describe("authenticateLogin callback", () => {
  let res: Partial<Response>;
  let next: NextFunction;
  let errorNull: null;
  let errorNotNull: Partial<mysql.MysqlError>;
  let resultsFalse: Partial<{}>;
  let resultsTrue: Partial<{}>;

  beforeEach(() => {
    resultsFalse = [{ passwordCorrect: 0 }];
    resultsTrue = [{ passwordCorrect: 1 }];
    errorNull = null;
    errorNotNull = new Error();
    next = jest.fn();
    res = {
      locals: {},
      cookie: jest.fn(),
    };
  });

  test("cb with results false", () => {
    authenticateLogin(
      errorNull,
      resultsFalse,
      res as Response,
      USERNAME,
      next as NextFunction
    );
    expect(next).toHaveBeenCalled();
    expect(res.locals?.username).toBeUndefined();
  });

  test("cb with results true", () => {
    authenticateLogin(
      errorNull,
      resultsTrue,
      res as Response,
      USERNAME,
      next as NextFunction
    );
    expect(next).toHaveBeenCalled();
    expect(res.locals?.username).toBe(USERNAME);
    expect(res.locals?.authed).toBe(true);
    expect(res.cookie).toHaveBeenCalledWith('token', expect.stringContaining('.'));
  });

  test("cb with error", () => {
    expect(() =>
      authenticateLogin(
        errorNotNull as mysql.MysqlError,
        resultsTrue,
        res as Response,
        USERNAME,
        next as NextFunction
      )
    ).toThrowError();
    expect(next).not.toHaveBeenCalled();
    expect(res.locals?.username).toBeUndefined();
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
