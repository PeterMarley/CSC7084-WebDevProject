
class Config {
    private _userDetailsValidation: IUserDetailsValidation;
    private _connection: IConnection;
    private _contexts: IContexts
    constructor() {
        try {
            this._userDetailsValidation = require('./userDetailsValidation.json');
            this._connection = require('./connection.json');
            this._contexts = require('./contexts.json');
        } catch (err: any) {
            throw new Error('Configuration file failed to load.');
        }
    }
    get connection() {
        return this._connection;
    }
    get userDetailsValidation() {
        return this._userDetailsValidation;
    }
    get contexts() {
        return this._contexts;
    }
}

const config = new Config();

interface IUserDetailsValidation {
    username: { minLength: number, maxLength: number, regex: RegExp, description: string };
    password: { minLength: number, maxLength: number, regex: RegExp, description: string };
    email: { regex: RegExp, description: string };
}

interface IConnection {
    port: number;
}

interface IContexts {
    name: { minLength: number, maxLength: number, regex: string }
    iconUrl: { regex: string }
}

export default config;
export { IUserDetailsValidation, IConnection };
