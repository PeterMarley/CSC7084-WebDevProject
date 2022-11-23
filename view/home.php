<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moodr</title>
    <link href="public/styles/styles.css" rel="stylesheet">
</head>
<body>
    <div id="header">
        <div>ICON</div>
        <div><a href="">Add Entry</a></div>
        <div>Visualise</div>
        <div>Manage Moods</div>
        <div>
            <?php if (checkLogin()): ?>
                <div>
                    Your account deets
                    <form method="POST" action="auth/logout" style="display: inline-block;">
                    <input type="submit" name="action" value="Log Out" class="login-control">
                </form>
                </div>
            <?php else: ?>
                <form method="POST" action="auth/logout" style="display: inline-block;">
                    <input type="submit" value="Log In" class="login-control">
                    <input type="text" name="redirect" value="/" hidden>
                </form>
                <form method="POST" action="auth/register" style="display: inline-block;">
                    <input type="submit" value="Register" class="login-control">
                    <input type="text" name="redirect" value="/" hidden>
                </form>
            <?php endif ?>
        </div>
    </div>
    <div id="body">
        <div>Nav</div>
        <div>
        <?php 
        // echo '<pre>';
        // echo '<hr>';
        // var_dump($_SESSION);
        // var_dump($_REQUEST);
        // var_dump($data['username']);
        // var_dump($data['password']);
        // var_dump($data['login']);
        // var_dump($_SESSION);
        // var_dump($_POST);
        // var_dump($_SERVER);
        // var_dump($_COOKIE);
        // var_dump($_ENV);
        // echo '/<pre>';

        //include 'templates/footer.php';
        ?>

        <?php if(checkLogin()): ?>
        <p>Welcome <?= $_SESSION['username'] ?>!</p>
        <?php else: ?>
        <form method="POST" action="auth/login">
            <div>
                <label for="username">Username:</label>
                <input type="text" name="username" placeholder="Enter username">
            </div>
            <div>
                <label for="username">Password:</label>
                <input type="password" name="password" placeholder="Enter password">
            </div>
            <!-- <input type="text" name="redirect" value="/dogs/nstuff" hidden> -->
            <input type="submit" name="log-in" value="login">
        </form>
        <?php endif?>
        </div>
    </div>
    <div id="footer">footer contents</div>
    </body>
</html>
<?php

function checkLogin() {
    return isset($_COOKIE['logged-in']) && $_COOKIE['logged-in'] == '1';
}