const express = require('express');
const app = express();

var phpExpress = require('php-express')({
  binPath: 'php'
});
app.set('views', './views');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// app.get('/', (req, res) => {
//   console.log('hello world')
//   //res.send('hi');
//   //res.status(200).json({message: "error"});
//   res.render('index', {text: "sup broski"});
// });

app.get('/', (req, res) => {
  console.log('hello world')
  //res.send('hi');
  //res.status(200).json({message: "error"});
  res.render('index', {text: "sup broski"});
});

/*
 * routers 
 */

// const userRouter = require('./routes/user.js');
// app.use('/user', userRouter);

server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('PHPExpress app listening at http://%s:%s', host, port);
});

