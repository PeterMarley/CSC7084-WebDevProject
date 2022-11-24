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
        <div><img src="public/icons/main_icon_128x128.png" alt="Moodr Icon" width="50%"></div>
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
                <form method="GET" action="registration" style="display: inline-block;">
                    <input type="submit" value="Register" class="login-control">
                </form>
            <?php endif ?>
        </div>
    </div>