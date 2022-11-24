<?php

define('BASE_ROUTE', '/');

$app->get(BASE_ROUTE, function ($req, $res) {
  $res->render('template', null);
});

$app->get(BASE_ROUTE.'registration', function ($req, $res) {
  $res->render('template', array('content'=>'register'));
});