<?php if (isset($_POST['log-in'])): // if login form has been submitted?>
  <?php include 'lib/script/login_handler.php'; ?>

  <?php if (isset($_SESSION['username']) && isset($_SESSION['encrypted-pw'])): // successful login?>
    <h1>You are logged in as: <?php echo $_SESSION['username'] ?></h1>
  <?php else: // unsuccessful login?>
    <h1>Login unsuccessful</h1>
  <?php endif ?>

<?php elseif (isset($_POST['log-out'])): ?>
  <?php 
    session_destroy(); 
    session_start(); 
  ?>
<?php endif ?>

<?php if (isset($_SESSION['username']) && isset($_SESSION['encrypted-pw'])): // display login form if not logged in?>
  <h1>Welcome back <?= $_SESSION['username'] ?>!</h1>
<?php else: ?>
  <form method="POST" action="">
    <div>
      <label for="username">Username:</label>
      <input type="text" name="username" placeholder="Enter username">
    </div>
    <div>
      <label for="username">Password:</label>
      <input type="password" name="password" placeholder="Enter password">
    </div>
    <input type="submit" name="log-in" value="login">
  </form>
<?php endif ?>