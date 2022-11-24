<?php
define('AUTH_BASE_ROUTE', '/auth');

require_once 'lib/script/user-account.php';
require_once 'lib/model/LoginResponse.php'


/********************************
 * 
 * LOG IN
 * 
 *******************************/

// $app->post(AUTH_BASE_ROUTE . '/login', function ($req, $res) {
//   $success = login($_POST['username'], $_POST['password']);
//   $res->redirect(Routing::redirect());
// });


$app->post(AUTH_BASE_ROUTE . '/login', function ($req, $res) {
  $success = false;
  $res->send(json_encode(new LoginResponse(login())));
});

/********************************
 * 
 * LOG OUT
 * 
 *******************************/

// $app->post(AUTH_BASE_ROUTE . '/logout', function ($req, $res) {
//   logout();
//   $res->redirect(Routing::redirect());
// });

// $app->get(AUTH_BASE_ROUTE . '/logout', function ($req, $res) {
//   logout();
//   $res->redirect(Routing::redirect());
// });

/********************************
 * 
 * USER REGISTRATION
 * 
 *******************************/

// $app->post(AUTH_BASE_ROUTE . '/register', function ($req, $res) {
//   register($_POST['username'], $_POST['password']);
//   login($_POST['username'], $_POST['password']);
//   $res->redirect(Routing::redirect());
// });

