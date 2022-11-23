<?php
require_once 'lib/login.php';
require_once 'lib/routing.php';


$app->post('/auth/login', function ($req, $res) {
  $success = login($_POST['username'], $_POST['password']);
  $res->redirect(Routing::redirect());
});

$app->post('/auth/logout', function ($req, $res) {
  logout();
  $res->redirect(Routing::redirect());
});

$app->get('/auth/logout', function ($req, $res) {
  logout();
  $res->redirect(Routing::redirect());
});


