const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.send('user router / path');
});

router.get('/register', (req, res) => {
  throw new Exception('register endpoint not implemented');
});

module.exports = router;