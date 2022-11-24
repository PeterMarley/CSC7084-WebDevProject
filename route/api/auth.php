<?php
require_once 'lib/user-account.php';
require_once 'lib/routing.php';

define('AUTH_BASE_ROUTE', '/auth');

/********************************
 * 
 * LOG IN
 * 
 *******************************/

$app->post(AUTH_BASE_ROUTE . '/login', function ($req, $res) {
  $success = login($_POST['username'], $_POST['password']);
  $res->redirect(Routing::redirect());
});

/********************************
 * 
 * LOG OUT
 * 
 *******************************/

$app->post(AUTH_BASE_ROUTE . '/logout', function ($req, $res) {
  logout();
  $res->redirect(Routing::redirect());
});

$app->get(AUTH_BASE_ROUTE . '/logout', function ($req, $res) {
  logout();
  $res->redirect(Routing::redirect());
});

/********************************
 * 
 * USER REGISTRATION
 * 
 *******************************/

$app->post(AUTH_BASE_ROUTE . '/register', function ($req, $res) {
  register($_POST['username'], $_POST['password']);
  login($_POST['username'], $_POST['password']);
  $res->redirect(Routing::redirect());
});

