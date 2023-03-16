
class Config {
    private _userDetailsValidation: IUserDetailsValidation;
    private _connection: IConnection;
    constructor() {
        try {
            this._userDetailsValidation = require('./userDetailsValidation.json');
            this._connection = require('./connection.json');
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

export default config;
export { IUserDetailsValidation, IConnection };
