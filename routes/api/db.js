const express = require('express');
const formParser = require('body-parser').urlencoded();
const mysql = require('sql');
const db = express.Router();

db.post('/checkpassword', formParser, (req, res) => {

});