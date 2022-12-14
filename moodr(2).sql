-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2022 at 01:17 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moodr`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_Create_User` (IN `username` VARCHAR(255), IN `pw` VARCHAR(255))   BEGIN
	DECLARE user_id int;
    
    -- insert user
    INSERT INTO tbl_user (tbl_user.username, tbl_user.password)
    VALUES (username, fn_1WayEncrypt(pw, NULL));

    SET user_id = LAST_INSERT_ID();
    
    -- insert default moods
    INSERT INTO tbl_mood 
    (
        tbl_mood.name, 
        tbl_mood.order, 
        tbl_mood.icon_image_id, 
        tbl_mood.user_id
    )
    VALUES 
    ('Awful', 1, 1, user_id),
    ('Bad', 2, 2, user_id),
    ('Ok', 3, 3, user_id),
    ('Good', 4, 4, user_id),
    ('Great', 5, 5, user_id);
    
    -- insert default activities
    INSERT INTO tbl_activity
    (
        tbl_activity.name,
        tbl_activity.icon_image_id,
        tbl_activity.activity_group_id,
        tbl_activity.user_id
    )
    VALUES
    ('Default',1,1,user_id);
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_1WayEncrypt` (`value` VARCHAR(255), `providedSalt` VARCHAR(6)) RETURNS VARBINARY(255)  BEGIN
   	DECLARE salt VARCHAR(255);
	DECLARE saltedHash VARBINARY(255);
   	DECLARE encryptedValue VARBINARY(255);

    SET salt = IF(ISNULL(providedSalt), SUBSTRING(SHA1(RAND()), 1, 6), providedSalt);
	SET saltedHash = SHA1(CONCAT(salt, `value`));
	SET encryptedValue = CONCAT(salt, saltedHash);
	RETURN encryptedValue;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_Check_Password` (`username` VARCHAR(255), `plainPassword` VARCHAR(255)) RETURNS INT(1)  BEGIN
	DECLARE storedPassword VARBINARY(255);
	DECLARE salt VARCHAR(255);
    
	SET storedPassword = (SELECT `password` FROM tbl_user WHERE tbl_user.username = username);
    
    SET salt = SUBSTRING(storedPassword, 1, 6);    
    
    RETURN IF(fn_1WayEncrypt(plainPassword, salt) = storedPassword, 1, 0);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_Check_Password_Reauth` (`username` VARCHAR(255), `encryptedPassword` VARBINARY(255)) RETURNS VARBINARY(255)  BEGIN
	DECLARE storedPassword VARBINARY(255);
	SET storedPassword = (SELECT `password` FROM tbl_user WHERE tbl_user.username = username);    
    RETURN IF(encryptedPassword = storedPassword, 1, 0);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity`
--

CREATE TABLE `tbl_activity` (
  `activity_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_image_id` int(11) NOT NULL,
  `activity_group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_group`
--

CREATE TABLE `tbl_activity_group` (
  `activity_group_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_image_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_group_image`
--

CREATE TABLE `tbl_activity_group_image` (
  `activity_group_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_image`
--

CREATE TABLE `tbl_activity_image` (
  `activity_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry`
--

CREATE TABLE `tbl_entry` (
  `entry_id` int(11) NOT NULL,
  `notes` text NOT NULL,
  `timestamp` int(11) NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `mood_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry_activity`
--

CREATE TABLE `tbl_entry_activity` (
  `entry_activity_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry_images`
--

CREATE TABLE `tbl_entry_images` (
  `entry_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL,
  `entry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood`
--

CREATE TABLE `tbl_mood` (
  `mood_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `order` int(11) NOT NULL,
  `icon_image_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood_image`
--

CREATE TABLE `tbl_mood_image` (
  `mood_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_mood_image`
--

INSERT INTO `tbl_mood_image` (`mood_image_id`, `url`, `alt_text`) VALUES
(1, '/icons/moods/awful.png', 'Awful Mood Icon'),
(2, '/icons/moods/bad.png', 'Bad Mood Icon'),
(3, '/icons/moods/okay.png', 'Okay Mood Icon'),
(4, '/icons/moods/good.png', 'Good Mood Icon'),
(5, '/icons/moods/great.png', 'Great Mood Icon');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

CREATE TABLE `tbl_user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_user`
--

INSERT INTO `tbl_user` (`user_id`, `username`, `password`, `email`) VALUES
(7, 'username', 'ac37d1d17121e233fe12d50b4161f8cc7722ff3e8f691d138fa7d87e2b4d2931d0d4e6', 'username@password.com'),
(9, 'dax', 'ac37d1d17121e233fe12d50b4161f8cc7722ff3e8f691d138fa7d87e2b4d2931d0d4e6', 'dax@reggie.com'),
(25, 'testinguser1', 'ac37d1d17121e233fe12d50b4161f8cc7722ff3e8f691d138fa7d87e2b4d2931d0d4e6', ''),
(56, 'randomcrap', '58eaac3db5155d6b5b5adce5fe38a228fd5e20807b439597d4bb223ed196f8701a39e7', 'randomcrap@password.com'),
(78, 'registertest', '7f1b1c644e52dd2fb8151e79ac4b948a920a39882cbe5c0cd312068fe723bf49d28c7e', 'registertest@registertest.com');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_activity`
--
ALTER TABLE `tbl_activity`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `FK__activity_group__activity_group_id` (`activity_group_id`),
  ADD KEY `FK__user__user_id_2` (`user_id`),
  ADD KEY `FK__activity_image__activity_image_id` (`icon_image_id`);

--
-- Indexes for table `tbl_activity_group`
--
ALTER TABLE `tbl_activity_group`
  ADD PRIMARY KEY (`activity_group_id`),
  ADD KEY `FK__image__image_id_3` (`icon_image_id`),
  ADD KEY `FK__user__user_id_4` (`user_id`);

--
-- Indexes for table `tbl_activity_group_image`
--
ALTER TABLE `tbl_activity_group_image`
  ADD PRIMARY KEY (`activity_group_image_id`);

--
-- Indexes for table `tbl_activity_image`
--
ALTER TABLE `tbl_activity_image`
  ADD PRIMARY KEY (`activity_image_id`);

--
-- Indexes for table `tbl_entry`
--
ALTER TABLE `tbl_entry`
  ADD PRIMARY KEY (`entry_id`),
  ADD KEY `FK__user__user_id_3` (`user_id`),
  ADD KEY `FK__mood__mood_id` (`mood_id`);

--
-- Indexes for table `tbl_entry_activity`
--
ALTER TABLE `tbl_entry_activity`
  ADD PRIMARY KEY (`entry_activity_id`),
  ADD KEY `FK__entry__entry_id_2` (`entry_id`),
  ADD KEY `FK__activity__activity_id_2` (`activity_id`);

--
-- Indexes for table `tbl_entry_images`
--
ALTER TABLE `tbl_entry_images`
  ADD PRIMARY KEY (`entry_image_id`),
  ADD KEY `FK__entry__entry_id` (`entry_id`);

--
-- Indexes for table `tbl_mood`
--
ALTER TABLE `tbl_mood`
  ADD PRIMARY KEY (`mood_id`),
  ADD UNIQUE KEY `order` (`order`),
  ADD KEY `FK__image__image_id` (`icon_image_id`),
  ADD KEY `FK__user__user_id` (`user_id`);

--
-- Indexes for table `tbl_mood_image`
--
ALTER TABLE `tbl_mood_image`
  ADD PRIMARY KEY (`mood_image_id`);

--
-- Indexes for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_activity`
--
ALTER TABLE `tbl_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_activity_group`
--
ALTER TABLE `tbl_activity_group`
  MODIFY `activity_group_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_activity_group_image`
--
ALTER TABLE `tbl_activity_group_image`
  MODIFY `activity_group_image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_activity_image`
--
ALTER TABLE `tbl_activity_image`
  MODIFY `activity_image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_entry`
--
ALTER TABLE `tbl_entry`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_entry_activity`
--
ALTER TABLE `tbl_entry_activity`
  MODIFY `entry_activity_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_entry_images`
--
ALTER TABLE `tbl_entry_images`
  MODIFY `entry_image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_mood`
--
ALTER TABLE `tbl_mood`
  MODIFY `mood_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_mood_image`
--
ALTER TABLE `tbl_mood_image`
  MODIFY `mood_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_user`
--
ALTER TABLE `tbl_user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_activity`
--
ALTER TABLE `tbl_activity`
  ADD CONSTRAINT `FK__activity_group__activity_group_id` FOREIGN KEY (`activity_group_id`) REFERENCES `tbl_activity_group` (`activity_group_id`),
  ADD CONSTRAINT `FK__activity_image__activity_image_id` FOREIGN KEY (`icon_image_id`) REFERENCES `tbl_activity_image` (`activity_image_id`),
  ADD CONSTRAINT `FK__user__user_id_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`);

--
-- Constraints for table `tbl_activity_group`
--
ALTER TABLE `tbl_activity_group`
  ADD CONSTRAINT `FK__activity_group_image__activity_group_image_id` FOREIGN KEY (`icon_image_id`) REFERENCES `tbl_activity_group_image` (`activity_group_image_id`),
  ADD CONSTRAINT `FK__user__user_id_4` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`);

--
-- Constraints for table `tbl_entry`
--
ALTER TABLE `tbl_entry`
  ADD CONSTRAINT `FK__mood__mood_id` FOREIGN KEY (`mood_id`) REFERENCES `tbl_mood` (`mood_id`),
  ADD CONSTRAINT `FK__user__user_id_3` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`);

--
-- Constraints for table `tbl_entry_activity`
--
ALTER TABLE `tbl_entry_activity`
  ADD CONSTRAINT `FK__activity__activity_id_2` FOREIGN KEY (`activity_id`) REFERENCES `tbl_activity` (`activity_id`),
  ADD CONSTRAINT `FK__entry__entry_id_2` FOREIGN KEY (`entry_id`) REFERENCES `tbl_entry` (`entry_id`);

--
-- Constraints for table `tbl_entry_images`
--
ALTER TABLE `tbl_entry_images`
  ADD CONSTRAINT `FK__entry__entry_id` FOREIGN KEY (`entry_id`) REFERENCES `tbl_entry` (`entry_id`);

--
-- Constraints for table `tbl_mood`
--
ALTER TABLE `tbl_mood`
  ADD CONSTRAINT `FK__mood_image__mood_image_id` FOREIGN KEY (`icon_image_id`) REFERENCES `tbl_mood_image` (`mood_image_id`),
  ADD CONSTRAINT `FK__user__user_id` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
