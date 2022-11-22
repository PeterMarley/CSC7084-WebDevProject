<!DOCTYPE html>
<?php require_once 'global.php'; ?>
<?php include 'view/templates/header.php' ?>
<?php include 'view/templates/navigation.php' ?>
  
  <div id="content-pane">
    <?php
    if (isset($_POST['process'])) {
      if ($_POST['process'] === 'user') {
        switch ($_POST['action']) {
          case 'Log In':
            include 'view/templates/forms/login_form.php';
            break;
          case 'Log Out':
            session_destroy();
            header('Location: index.php');
            break;
          case 'welcome':
            include 'view/templates/welcome.php';
            break;
        }
      }
    }
    ?>
  </div>
  
<?php include 'view/templates/footer.php' ?>
 
