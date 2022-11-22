<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moodr</title>
  <style><?php include 'styles/styles.css' ?></style>
</head>
<body>
<div id="header">
    <div>
      ICON
    </div>
    <div>
      <a href="/add-entry"> Add Entry</a>
    </div>
    <div>
      Visualise<?= str_replace('\\', '/', __DIR__) ?>
    </div>
    <div>
      Manage Moods
    </div>
    <div>
      <?php if (!isset($_COOKIE['sessionaaayy'])): ?>
      <form method="POST" action="index.php" style="display: inline-block;">
        <input type="text" name="process" value="user" hidden>
        <input type="submit" name="action" value="Log In" class="login-control">
      </form>
      | Register | 
      <form method="POST" action="index.php" style="display: inline-block;">
        <input type="text" name="process" value="user" hidden>
        <input type="submit" name="action" value="Log Out" class="login-control">
      </form>
      <?php endif ?>
    </div>
  </div>
  <div id="body">
  <div>nav menu?</div>
  
  <div id="content-pane">
    <?php
      echo "<pre>$text";
      var_dump($_REQUEST);
      var_dump($_ENV);
      var_dump($_);
      echo '</pre>';
      echo '<hr>';
      echo '<pre>';
      var_dump($_GET);
      echo '</pre>';
      echo '<hr>';
      echo '<pre>';
      var_dump($_POST);
      echo '</pre>';
      echo '<hr>';
      echo '<pre>';
      var_dump($_SERVER);
      echo '</pre>';
      echo '<hr>';
      echo '<pre>';
      var_dump($_COOKIES);
      echo '</pre>';
      echo '<hr>';
    ?>
  </div>
  
  </div>
  <div id="footer">
      footer contents
  </div>

</body>
</html>
 
