<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moodr</title>
  <link href="view/styles/styles.css" rel="stylesheet">
</head>
<body>
  <?php 
    // include 'controller/api/Database.php'; 
    // $x = new DatabaseApi();
    // //echo $x->checkPassword('username', 'password');
    // var_dump($x->checkPassword('username', 'password'));
  ?>
  <?php //include 'src/templates/header.php' ?>
  <div id="header">
    <div>
      ICON
    </div>
    <div>
      <a href="<?= 'index.php/test';?>"> Add Entry</a>
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
    <div>content?</div>
  </div>
  
  <?php //include 'src/templates/footer.php' ?>
  <div id="footer">
    footer contents
  </div>

</body>
</html>