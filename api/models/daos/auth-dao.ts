import { format, ResultSetHeader, RowDataPacket } from "mysql2";
import checkPasswordCorrect, { encrypt } from "../../utils/crypt";
import getConnection from "../../utils/dbConnection";
import { createToken } from "../../../app/utils/jwtHelpers"
import AccountDetailsGetResponse from "../responses/auth/AccountDetailsGetResponse";
import DeleteAccountResponse from "../responses/auth/DeleteAccountResponse";
import LoginResponse from "../responses/auth/LoginResponse";
import RegistrationResponse from "../responses/auth/RegistrationResponse";


/**
 * This is a static class in that it may not be instantiated. It's methods may be called to generate response objects after queries the database
 */
class AuthApiDataAccessObject {
    async changePassword(password: string, userId: number): Promise<boolean> {
        let success = false;
        try {
            if (this.validatePassword(password)) {
                const updateAccountDetailsSql = format(`CALL usp_update_password(?,?)`, [userId, encrypt(password)]);
                const con = await getConnection();

                success = ((await con.execute(updateAccountDetailsSql)).at(0) as ResultSetHeader).affectedRows === 1;

                con.end();
            }
        } catch (err) {
            console.log('updating account password failed.');
        }
        return success;
    }

    async updateAccountDetails(userId: number, username: string, email: string): Promise<boolean> {
        let success = false;

        try {
            if (this.validateUsername(username) && this.validateEmail(email)) {
                const updateAccountDetailsSql = format(`UPDATE tbl_user u SET u.username = ?, u.email=? WHERE u.user_id = ?`, [username, email, userId]);
                const con = await getConnection();
                success = ((await con.execute(updateAccountDetailsSql)).at(0) as ResultSetHeader).affectedRows === 1;
                con.end();
            }
        } catch (err) {
            console.log('updating account details failed:');
            console.log(`userId: ${userId}, new username: ${username}, new email: ${email}`);
        }

        return success;
    }

    async getAccountDetails(userId: number): Promise<AccountDetailsGetResponse> {
        const formattedSql = format("SELECT username, email FROM tbl_user WHERE user_id=?", [userId]);

        const con = await getConnection();
        const response = ((await con.execute(formattedSql)).at(0) as RowDataPacket).at(0) as AccountDetailsGetResponse;
        con.end();

        return response;
    }

    async deleteUserAccount(userId: number, username: string, email: string): Promise<DeleteAccountResponse> {
        let success = false;
        let error: string | undefined;
        try {
            const con = await getConnection();
            //TODO more probably needed here
            con.execute('DELETE FROM tbl_activity WHERE user_id=?', [userId]);
            con.execute('DELETE FROM tbl_activity_group WHERE user_id=?', [userId]);
            con.execute('DELETE FROM tbl_mood WHERE user_id=?', [userId]);
            con.execute('DELETE FROM tbl_user WHERE username=? AND user_id=? AND email=?', [username, userId, email]);
            con.end();
            success = true;
        } catch (err: any) {
            error = err.message as string;
        }

        return new DeleteAccountResponse(success, error);
    }

    /**
     * Register a new user
     * @param username 
     * @param email 
     * @param password 
     * @returns a 2 length array. element at index 0 is the http status code for the response, and element
     * at index 1 is the actual response object
     */
    async register(username: string, email: string, password: string): Promise<[number, RegistrationResponse]> {
        // validate registration info by database query to ensure username and email unique
        let con = await getConnection();
        const usernameResponse = await con.execute(`SELECT COUNT(username) AS usernameCount FROM tbl_user WHERE username=?`, [username]) as any;
        const emailResponse = await con.execute(`SELECT COUNT(email) AS emailCount FROM tbl_user WHERE email=?`, [email]) as any;
        con.end();


        const usernameCount = usernameResponse.at(0).at(0).usernameCount;
        const emailCount = emailResponse.at(0).at(0).emailCount;

        const dbValidationErr: Array<string> = [];
        if (usernameCount !== 0) dbValidationErr.push('username taken');
        if (emailCount !== 0) dbValidationErr.push('email taken');

        if (dbValidationErr.length !== 0) {
            return [401, new RegistrationResponse(false, dbValidationErr)];
        }

        con = await getConnection();
        try {

            const insertUserSql = format(
                'INSERT INTO tbl_user (username, password, email, user_icon_id) VALUES (?,?,?,1)',
                [username, encrypt(password), email]
            );
            const insertUserResult = await con.execute(insertUserSql) as any;
            const userId: number = insertUserResult.at(0).insertId;

            // const insertMoodsResult = await con.execute(SQL.register.insertMoods, Array(5).fill(userId)) as any;
            const insertActivityGroupsSql = format(
                `INSERT INTO tbl_activity_group
                (
                    tbl_activity_group.name,
                    tbl_activity_group.icon_image_id,
                    tbl_activity_group.user_id
                )
                VALUES
                ('Default', 1, ?)`,
                [userId]
            );

            const insertActivityGroupsResult = await con.execute(insertActivityGroupsSql) as any;
            const activityGroupId: number = insertActivityGroupsResult.at(0).insertId;

            const insertDefaultActivitiesSql = format(
                `INSERT INTO tbl_activity
                (
                    tbl_activity.name,
                    tbl_activity.icon_image_id,
                    tbl_activity.activity_group_id,
                    tbl_activity.user_id
                )
                VALUES
                ('Work',1,?,?),
                ('Exersize',2,?,?)`,
                [activityGroupId, userId, activityGroupId, userId]
            );
            const insertDefaultActivitiesResult = await con.execute(insertDefaultActivitiesSql) as any;

            return [200, new RegistrationResponse(true)];
        } catch (err: any) {
            console.log(err);
            return [500, new RegistrationResponse(false, ['something went wrong registering you?! ' + err.message])];
        } finally {
            con.end();
        }
    }

    async login(username: string, passwordFromForm: string): Promise<[number, LoginResponse]> {
        let success: boolean = false;
        let token: string | undefined;
        let error: Array<string> = [];

        // query db for user data
        let con = await getConnection();

        const result = await con.execute('SELECT user_id, password, email FROM tbl_user WHERE username=?', [username]) as any;
        con.end();

        if (result[0][0] === undefined) {
            return [401, new LoginResponse(false, undefined, ['user does not exist'])];
        }
        // destructure data from DB resultset
        const { user_id, password: passwordFromDb, email } = result[0][0];

        // check if passwords match by encrypting form password with db passwords salt and checking equality
        if (checkPasswordCorrect(passwordFromDb, passwordFromForm)) {
            success = true;
            token = createToken(user_id, username, email);
        }
        
        // prepare and send json response
        return [200, new LoginResponse(success, token, error)];
    }

    private validatePassword(password: string) {
        //TODO actual password validation
        return true;
    }

    private validateUsername(username: string): boolean {
        if (!username) return false;
        return /[a-zA-Z0-9]{8,15}/.test(username);
    }

    private validateEmail(email: string): boolean {
        if (!email) return false;
        // extremely basic email regex, suitable for the purposes of this project
        const emailRegex = /[a-zA-Z0-8]{1,}[@][a-zA-Z0-8]{1,}[\.][a-zA-Z0-8]{1,}/
        return emailRegex.test(email);
    }
}

export default new AuthApiDataAccessObject();