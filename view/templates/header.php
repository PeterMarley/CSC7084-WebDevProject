<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moodr</title>
  <link href="<?= buildPathRelative('/view/styles/styles.css'); ?>" rel="stylesheet">
</head>
<body>
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
      <form method="POST" action="index.php" style="display: inline-block;">
        <input type="text" name="process" value="user" hidden>
        <input type="submit" name="action" value="Log In" class="login-control">
      </form>
      | Register | 
      <form method="POST" action="index.php" style="display: inline-block;">
        <input type="text" name="process" value="user" hidden>
        <input type="submit" name="action" value="Log Out" class="login-control">
      </form>
    </div>
  </div>
  <div id="body">