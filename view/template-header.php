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