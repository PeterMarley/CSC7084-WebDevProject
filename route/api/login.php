<?php
require_once 'controller/Login.php';

$app->post('/login', function ($req, $res) {
  $success = login($_POST['username'], $_POST['password']);
  $res->redirect(isset($_POST['redirect']) ? $_POST['redirect'] : '/');
});
