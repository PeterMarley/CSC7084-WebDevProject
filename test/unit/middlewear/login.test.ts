import { Request, Response, NextFunction } from "express";
import { LoginResponse } from "../../../models/authResponses";
import login, { cb } from "../../../routes/middleware/login";
import mysql from 'mysql';

const USERNAME: string = process.env.MOODR_TEST_USER_USERNAME!;
const PASSWORD = process.env.MOODR_TEST_USER_PASSWORD;
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
			expect(next).not.toHaveBeenCalled();
		});

		test("no username", () => {
			req.method = POST;
			req.body.password = PASSWORD;
			login(req as Request, res as Response, next);
			expect(res.json).toHaveBeenCalled();
			expect(res.json).toBeCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith(new LoginResponse([ERR_MSG_LOGIN_USERNAME]));
			expect(res.cookie).not.toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		});

		test("no password", () => {
			req.method = POST;
			req.body.username = USERNAME;
			login(req as Request, res as Response, next);
			expect(res.json).toHaveBeenCalled();
			expect(res.json).toBeCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith(new LoginResponse([ERR_MSG_LOGIN_PASSWORD]));
			expect(res.cookie).not.toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		});
	});

	describe('valid login', () => {
		let req: Partial<Request>;
		let res: Partial<Response>;
		let next: NextFunction;

		let connect: Partial<mysql.Connection>;

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
				locals: {
					username: undefined
				},
			};
			next = jest.fn();
			connect = {
				query: jest.fn(),
				end: jest.fn()
			}
		});

		test('login', async () => {
			let getConFunc = jest.fn(() => connect as mysql.Connection);
			let cb = jest.fn();
			await login(req as Request, res as Response, next, getConFunc, cb);
			expect(getConFunc).toHaveBeenCalledTimes(1);
			expect(connect.query).toHaveBeenCalledTimes(1);
			expect(connect.end).toHaveBeenCalledTimes(1);
		});
	});

	describe('login callback', () => {
		let res: Partial<Response>;
		let next: NextFunction;
		let errorNull: null;
		let errorNotNull: Partial<mysql.MysqlError>;
		let resultsFalse: Partial<{}>;
		let resultsTrue: Partial<{}>;

		beforeEach(() => {
			resultsFalse = [{ passwordCorrect: false }];
			resultsTrue = [{ passwordCorrect: true }];
			errorNull = null;
			errorNotNull = new Error();
			next = jest.fn();
			res = {
				locals: {},
				cookie: jest.fn()
			}
		});

		test('cb with results false', () => {
			cb(errorNull, resultsFalse, res as Response, USERNAME, next as NextFunction);
			expect(next).toHaveBeenCalled();
			expect(res.locals?.username).toBeUndefined();
		});

		test('cb with results true', () => {
			cb(errorNull, resultsTrue, res as Response, USERNAME, next as NextFunction);
			expect(next).toHaveBeenCalled();
			expect(res.locals?.username).toBe(USERNAME);
			expect(res.cookie).toHaveBeenCalled();
		});

		test('cb with error error', () => {
			expect(
				() => cb(errorNotNull as mysql.MysqlError, resultsTrue, res as Response, USERNAME, next as NextFunction)
			).toThrowError();
			expect(next).not.toHaveBeenCalled();
			expect(res.locals?.username).toBeUndefined();
			expect(res.cookie).not.toHaveBeenCalled();
		});
	});
});

