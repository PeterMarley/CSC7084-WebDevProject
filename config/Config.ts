
class Config {
    userDetailsValidation: IUserDetailsValidation;
    connection: IConnection;
    constructor() {
        try {
            this.userDetailsValidation = require('./userDetailsValidation.json');
            this.connection = require('./connection.json');
        } catch (err: any) {
            throw new Error('Configuration file failed to load.');
        }
    }
}

const config = new Config();

interface IUserDetailsValidation {
    username: { minLength: number, maxLength: number, regex: RegExp };
    password: { minLength: number, maxLength: number, regex: RegExp };
    email: { regex: RegExp };
}

interface IConnection {
    port: number;
}

export default config;
export { IUserDetailsValidation, IConnection };
