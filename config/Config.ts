
class Config {
    private userDetailsValidation: IUserDetailsValidation;
    constructor() {
        try {
            this.userDetailsValidation = require('./userDetailsValidation.json');
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

export default config;
export { IUserDetailsValidation };
