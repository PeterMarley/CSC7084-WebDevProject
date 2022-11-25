const express = require('express');
const authRouter = express.Router();
const bodyParser = require('body-parser');

const formParser = bodyParser.urlencoded({extended: false});

authRouter.post('/login', formParser ,(req, res) => {
  //const {username, password} = req.body;
  //console.log(username + ' ' + password);
  res.send(req.body.username);
});

authRouter.post('/logout', formParser ,(req, res) => {
  //const {username, password} = req.body;
  //console.log(username + ' ' + password);
  res.send(req.body.username);
});

module.exports = authRouter;