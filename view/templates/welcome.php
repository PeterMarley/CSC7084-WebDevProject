<?php if (isset($_SESSION['username']) && isset($_SESSION['encrypted-pw'])): // successful login?>
  <h1>You are logged in as: <?php echo $_SESSION['username'] ?></h1>
<?php else: // unsuccessful login?>
  <h1>A hoy hoy</h1>
<?php endif ?>