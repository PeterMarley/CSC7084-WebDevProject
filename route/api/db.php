<?php

define('DB_BASE_URL', 'db');
require_once 'lib/script/user-account.php';

$app->post(DB_BASE_URL . '/login', function ($req, $res) {
  $success = false;
  $res->send(json_encode(new LoginResponse(login())));
});