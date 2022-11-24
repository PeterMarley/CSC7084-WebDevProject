<!DOCTYPE html>
<?php
function checkLogin() {
    return isset($_COOKIE['logged-in']) && $_COOKIE['logged-in'] == '1';
}
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moodr</title>
    <link href="public/styles/styles.css" rel="stylesheet">
</head>
<body>
    <?php include 'template-header.php' ?>
    <div id="body">
        <div><?php include 'template-nav.php'; ?></div>
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

        if (isset($data) && isset($data['content'])) {
            switch ($data['content']) {
                case 'register':
                    include 'forms/register_form.php';
                    break;
                default:
                    echo 'Unknown content!';
            }
        } else {
            include 'forms/login_form.php';
        }
        ?>
        </div>
    </div>
    <?php include 'template-footer.php' ?>
    </body>
</html>
