<!DOCTYPE html>
<?php 
  // requires
  require_once 'inc/Logger.php';

  // instantiate database path

  // instantiate logger
  $logger = new Logger();
  //$logger->log(buildPathAbsolute('/view/styles/styles.css'));
?>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moodr</title>
  <link href="<?= buildPathRelative('/view/styles/styles.css'); ?>" rel="stylesheet">
</head>
<body>
  <?php //include 'src/templates/header.php' ?>
  <div id="header">
    <div>
      ICON
    </div>
    <div>
      <a href="<?= HOME ?>/add-entry"> Add Entry</a>
    </div>
    <div>
      Visualise
    </div>
    <div>
      Manage Moods
    </div>
    <div>
      Login | Register
    </div>
  </div>

  <div id="body">
    <?php //include 'src/templates/nav.php' ?>
    <div>nav menu?</div>
    <div>
      <?php 
        //var_dump($_COOKIE);
      ?>


      <?php if (isset($_COOKIE['ls']) && $_COOKIE['ls'] === '1'): ?>
        <h1>You are logged in as: <?php echo $_COOKIE['un'] ?></h1>
      <?php else: ?>
        <?php if (isset($_COOKIE['ls']) && $_COOKIE['ls'] === '0'): ?>
        <h1>Login unsuccessful</h1>
        <?php endif ?>
        <form method="POST" action="<?= buildPathRelative('/controller/api/login.php?redirect=index.php');?>">
          <div>
            <label for="username">Username:</label>
            <input type="text" name="username" placeholder="Enter username">
          </div>
          <div>
            <label for="username">Password:</label>
            <input type="password" name="password" placeholder="Enter password">
          </div>
          <input type="submit" name="login-submit">
        </form>
      <?php endif ?> 

    </div>
  </div>
  
  <?php //include 'src/templates/footer.php' ?>
  <div id="footer">
    footer contents
  </div>

</body>
</html>
