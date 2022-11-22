<?php

/*
 *   _____                                ____  _   _ ____
 *  | ____|_  ___ __  _ __ ___  ___ ___  |  _ \| | | |  _ \
 *  |  _| \ \/ / '_ \| '__/ _ \/ __/ __| | |_) | |_| | |_) |
 *  | |___ >  <| |_) | | |  __/\__ \__ \ |  __/|  _  |  __/
 *  |_____/_/\_\ .__/|_|  \___||___/___/ |_|   |_| |_|_|   v 1.0.0
 *             |_|
 *
*/

# Require Express PHP Framework...
require_once 'Express.php';

# Create an Expess PHP app...
global $app;
$app = new Express();

$app->set('basePath', '/uni/project');
$app->set('view engine', 'default');
$app->set('views', 'views/');

session_start();

$app->get('/', function ($req, $res) {
  // public function render($template, $data) {
  $_SESSION['data'] = array("beep"=>"boop");
  $res->render('home', array());
});
