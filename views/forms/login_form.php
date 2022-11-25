<?php if(checkLogin()): ?>
<p>Welcome, you are logged in as <b><?= $_SESSION['username'] ?></b>!</p>
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