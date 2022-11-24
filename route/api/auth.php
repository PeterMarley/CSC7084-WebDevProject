<?php
define('AUTH_BASE_ROUTE', '/auth');

require_once 'lib/script/auth-functions.php';
require_once 'lib/model/AuthResponses.php';

/**
 * These routes describe a REST API which controls user authorization
 */


/********************************
 * 
 * LOG IN
 * 
 *******************************/

$app->post(AUTH_BASE_ROUTE . '/login', function ($req, $res) {
  if (!isset($_POST['username']) || !isset($_POST['password'])) {
    $response = false;
    $reason = 'username and/ or password post data missing';
  } else {
    $response = login($_POST['username'], $_POST['password']);
    $reason = $response ? '' : 'username or password incorrect';
  }
  $res->send(json_encode(new LoginResponse($response, $reason)), ['Content-Type' => 'application/json']);
});

/********************************
 * 
 * REAUTH LOGIN
 * 
 *******************************/

$app->get(AUTH_BASE_ROUTE . '/reauth', function ($req, $res) {
  $res->send(json_encode(new ReauthResponse(is_logged_in())), ['Content-Type' => 'application/json']);
});

/********************************
 * 
 * LOG OUT
 * 
 *******************************/

$app->post(AUTH_BASE_ROUTE . '/logout', function ($req, $res) {
  $wasLoggedIn = is_logged_in();
  logout();
  $res->send(json_encode(new LogoutResponse($wasLoggedIn)), ['Content-Type' => 'application/json']);
});

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
