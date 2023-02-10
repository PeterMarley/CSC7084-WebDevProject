import express from 'express';


import controller from '../controllers/authController';
const authAPI = express.Router();


authAPI.use(express.urlencoded({ extended: false }));


authAPI.post('/login', controller.login);
authAPI.post('/register', controller.register);

authAPI.delete('/deleteuser', controller.deleteUserAccount);

authAPI.get('/userdetails/:userId', controller.getAccountDetails);
authAPI.put('/userdetails/:userId', controller.updateAccountDetails);
authAPI.patch('/userdetails/:userId/password', controller.accountPasswordPatch);

export default authAPI;