import { Request, Response, NextFunction } from "express";
import { LoginResponse } from "../../../models/authResponses";
import { validateRegistrationForm, register } from '../../../routes/middleware/registration';
import mysql, { Connection, QueryFunction } from "mysql";
import * as dotenv from 'dotenv';
dotenv.config();

const USERNAME = 'anewtestuser';
const PASSWORD = 'password';
const EMAIL = 'anewtestuser@password.com';

describe('validateRegistrationForm() function', () => {
    describe('valid form submitted', () => {
        let req: Partial<Request>;
        let res: Partial<Response>;
        let next: NextFunction;
        let connect: Partial<mysql.Connection>;
        let query: Partial<mysql.queryCallback>;
        let results;

        beforeEach(() => {
            results = [
                [{ usernameCount: 0 }],
                [{ emailCount: 0 }]
            ];
            query = jest.fn((a: mysql.MysqlError | undefined, b: any, c: mysql.queryCallback) => c(null, results, undefined));
            req = {
                method: 'POST',
            };
            res = {
                locals: {},
                status: jest.fn(() => res as Response),
                send: jest.fn(() => res as Response)
            };
            connect = {
                query: query as QueryFunction,
                end: jest.fn(),
            };
            next = jest.fn();
        });

        test('valid form', () => {
            req.body = {
                username: USERNAME,
                password: PASSWORD,
                email: EMAIL
            }
            validateRegistrationForm(req as Request, res as Response, next, () => connect as Connection);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();

            expect(res.locals?.registration).not.toBeUndefined();
            expect(res.locals?.registration.success).toBe(true);
            
            expect(res.locals?.registration.user).not.toBeUndefined();
            expect(res.locals?.registration.user.username).toBe(USERNAME);
            expect(res.locals?.registration.user.email).toBe(EMAIL);
            expect(res.locals?.registration.user.password).toBe(PASSWORD);

        });
    });
});