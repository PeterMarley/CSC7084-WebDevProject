<!DOCTYPE html>
<html>
    <head>
      <title> <?php echo $data["appName"]." / ".$data["title"]; ?></title>
      </head>
      <body>
        <h1>Express PHP. It works</h1>
        <?php 
            echo '<pre>'; 
            var_dump($_SESSION);
            var_dump($_REQUEST);
            var_dump($_GET);
            var_dump($_POST);
            var_dump($_SERVER);
            var_dump($_COOKIE);
            var_dump($_ENV);
            echo '/<pre>';
        ?>
      </body>
</html>