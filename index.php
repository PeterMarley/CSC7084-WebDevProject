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
$app->set('views', 'view/');
$app->set('static', 'public/');

/********************************
 * 
 * MIDDLEWARE
 * 
 *******************************/

$app->use(session_start());

/********************************
 * 
 * ROUTES
 * 
 *******************************/

require_once 'route/auth.php';

$app->get('/', function ($req, $res) {
  $res->render('home', null);
});

