<!DOCTYPE html>
<?php 
  // requires
  require_once 'inc/Logger.php';
  require_once 'global.php';

  // start/ resume session
  session_start();

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
      Login | Register | 
      <form method="POST" action="" style="display: inline-block;">
        <input type="submit" name="log-out" value="Log Out" class="login-control">
      </form>
    </div>
  </div>
  
  <div id="body">
    <?php //include 'src/templates/nav.php' ?>
    <div>nav menu?</div>
    <div>
      <?php if (isset($_POST['log-in'])): // if login form has been submitted?>
        <?php 
          // process login
          $fields = ['username' => $_POST['username'], 'password' => $_POST['password']];
          $fields_string = http_build_query($fields);

          $ch = curl_init(LOGIN_URL);
          curl_setopt($ch, CURLOPT_POST, true);
          curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // resolve this?

          $result = json_decode(curl_exec($ch));
          curl_close($ch);

          if($result->encryptedPassword != 0) {
            echo 'huzzah! welcome ' . $result->username;
            $_SESSION['username'] = $result->username;
            $_SESSION['encrypted-pw'] = $result->encryptedPassword;
            $_SESSION['login-time'] = time();
          }
        ?>

        <?php if (isset($_SESSION['username']) && isset($_SESSION['encrypted-pw'])): // successful login?>
          <h1>You are logged in as: <?php echo $_SESSION['username'] ?></h1>
        <?php else: // unsuccessful login?>
          <h1>Login unsuccessful</h1>
        <?php endif ?>

      <?php elseif (isset($_POST['log-out'])): ?>
        <?php session_destroy(); session_start(); ?>
      <?php endif ?>
      <?php if (isset($_SESSION['username']) && isset($_SESSION['encrypted-pw'])): // display login form is not logged in?>
        <h1>Welcome back!</h1>
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
          <input type="text" name="redirect" value="index.php" hidden>
          <input type="submit" name="log-in" value="login">
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