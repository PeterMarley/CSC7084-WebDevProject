import { format, ResultSetHeader, RowDataPacket } from "mysql2";
import checkPasswordCorrect, { encrypt } from "../../utils/crypt";
import getConnection from "../../utils/dbConnection";
import { createToken } from "../../../utils/jwtHelpers"
import AccountDetailsGetResponse from "../responses/auth/AccountDetailsGetResponse";
import DeleteAccountResponse from "../responses/auth/DeleteAccountResponse";
import LoginResponse from "../responses/auth/LoginResponse";
import RegistrationResponse from "../responses/auth/RegistrationResponse";


/**
 * This is a static class in that it may not be instantiated. It's methods may be called to generate response objects after queries the database
 */
class BaseDao {
   
    private static getConnection() {
        return getConnection();
    }

    private static validatePassword(password: string) {
        //TODO actual password validation
        return true;
    }

    private static validateUsername(username: string): boolean {
        if (!username) return false;
        return /[a-zA-Z0-9]{8,15}/.test(username);
    }

    private static validateEmail(email: string): boolean {
        if (!email) return false;
        // extremely basic email regex, suitable for the purposes of this project
        const emailRegex = /[a-zA-Z0-8]{1,}[@][a-zA-Z0-8]{1,}[\.][a-zA-Z0-8]{1,}/
        return emailRegex.test(email);
    }
}

export default BaseDao;