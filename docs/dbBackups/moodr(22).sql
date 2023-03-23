-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2023 at 01:24 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

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
CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_Create_User` (IN `username` VARCHAR(255), IN `encryptedPassword` VARCHAR(255), IN `email` INT)   BEGIN
	DECLARE user_id int;
    DECLARE activity_group_id int;
    
    -- insert user
    INSERT INTO tbl_user (tbl_user.username, tbl_user.password, tbl_user.email)
    VALUES (username, encryptedPassword, email);

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
    
    -- insert default activity group
    INSERT INTO tbl_activity_group
    (
    	tbl_activity_group.name,
        tbl_activity_group.icon_image_id,
        tbl_activity_group.user_id
    )
    VALUES
    ('Default', 1, user_id);
    
    SET activity_group_id = LAST_INSERT_ID();

    -- insert default activities
    INSERT INTO tbl_activity
    (
        tbl_activity.name,
        tbl_activity.icon_image_id,
        tbl_activity.activity_group_id,
        tbl_activity.user_id
    )
    VALUES
    ('Work',1,activity_group_id,user_id),
    ('Exersize',2,activity_group_id,user_id);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_delete_account` (IN `userId` INT)   BEGIN
	START TRANSACTION;
	    -- SELECT 1337 INTO number;
    	CREATE TEMPORARY TABLE entryIds (entryId INT);
		
        INSERT INTO entryIds
        	SELECT entry_id FROM tbl_entry 
        	WHERE user_id=userId;
    
	    DELETE FROM tbl_entry_activity WHERE entry_id IN (SELECT * FROM entryIds);
	    DELETE FROM tbl_entry_images WHERE entry_id IN (SELECT * FROM entryIds);
        DELETE FROM tbl_entry WHERE user_id=userId;
        DELETE FROM tbl_activity WHERE user_id=userId;
	    DELETE FROM tbl_activity_group WHERE user_id=userId;
	    DELETE FROM tbl_user WHERE user_id=userId;
	COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_delete_entry` (IN `userId` INT, IN `entryId` INT)   BEGIN
    DELETE FROM tbl_entry_activity
    WHERE tbl_entry_activity.entry_id = entryId;
    
    DELETE FROM tbl_entry_images
    WHERE tbl_entry_images.entry_id = entryId;
    
    DELETE FROM tbl_entry
	WHERE tbl_entry.entry_id = entryId;    
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_get_visual_summary` (IN `userId` INT)   BEGIN
	DECLARE x  INT;
	DECLARE str  VARCHAR(255);
    DECLARE dateholder DATE;
    
    CREATE TEMPORARY TABLE dates (thedate DATE);
    CREATE TEMPORARY TABLE thedata (thedate DATE, mood varchar(255), freq INT(11));
	
    INSERT INTO dates
    SELECT DATE(e.timestamp) FROM tbl_entry e
        WHERE e.user_id=userId
        GROUP BY DATE(e.timestamp)
        ORDER BY DATE(e.timestamp) ASC;
   
	SET x = 1;
	SET str =  '';
	builder_loop: LOOP
    	IF (SELECT count(*) FROM dates) = 0 THEN
        	LEAVE builder_loop;
        END IF;
        SET dateholder = (SELECT thedate FROM dates LIMIT 1);
        
        INSERT INTO thedata
        SELECT DATE(e.timestamp), m.name, COUNT(*)
        	FROM tbl_entry e 
            INNER JOIN tbl_mood m ON e.mood_id=m.mood_id
            WHERE DATE(e.timestamp) = dateholder
            GROUP BY DATE(e.timestamp), m.name
            ORDER BY COUNT(*) DESC
            LIMIT 1;
            
		DELETE FROM dates WHERE thedate=dateholder;
    END LOOP;
    
    SELECT 
    	d.thedate,
        d.mood,
        d.freq,
        mv.mood_valence_name AS valence,
        ma.mood_arousal_name AS arousal
    FROM thedata d
    INNER JOIN tbl_mood m ON m.name=d.mood
    INNER JOIN tbl_mood_valence mv ON mv.mood_valence_id=m.mood_valence_id
    INNER JOIN tbl_mood_arousal ma ON ma.mood_arousal_id=m.mood_arousal_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_insert_entry` (IN `userId` INT, IN `moodName` VARCHAR(255), IN `notes` TEXT, IN `activityNameCommaDelimStr` VARCHAR(1000), OUT `entryIdOut` INT)   BEGIN
	DECLARE moodId int;
    DECLARE activityId int;
    DECLARE entryId int;
    DECLARE loopDone int DEFAULT 0;
    DECLARE activityCursor CURSOR FOR 
    	SELECT a.activity_id 
        FROM tbl_activity a 
        WHERE FIND_IN_SET(a.name, activityNameCommaDelimStr)
        AND a.user_id=userId;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET loopDone = 1;
    DECLARE exit handler for sqlexception
    BEGIN
   		GET DIAGNOSTICS CONDITION 1 @errNo = MYSQL_ERRNO, @errMsg = MESSAGE_TEXT;
  		SELECT @errNo, @errMsg;
        ROLLBACK;
    END;
    -- SET autocommit = 0;
	START TRANSACTION;
        -- get mood id
        SELECT m.mood_id 
        INTO moodId
        FROM tbl_mood m
        WHERE m.name = moodName
        LIMIT 1;
		  
        -- insert entry
        INSERT INTO tbl_entry 
            (tbl_entry.notes, tbl_entry.user_id, tbl_entry.mood_id)
        VALUES
            (notes, userId, moodId);

        -- get entry id
        SELECT LAST_INSERT_ID() INTO entryId;

        -- insert entry activities
        OPEN activityCursor;
        activity_loop: LOOP
            FETCH activityCursor INTO activityId;
            IF loopDone THEN
                LEAVE activity_loop;
            END IF;
            INSERT INTO tbl_entry_activity
                (tbl_entry_activity.entry_id, tbl_entry_activity.activity_id)
            VALUES (entryId, activityId);
        END LOOP activity_loop;
		
        SELECT entryId INTO entryIdOut;
        
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_activities_by_entry_id` (IN `entryId` INT)   SELECT 
	a.name as activityName,
	a.activity_id as activityId,
	a.activity_group_id as activityGroupId,
	ea.entry_id AS entryId,
	ai.url as iconUrl,
	ai.alt_text as iconAltText
FROM tbl_entry_activity ea
INNER JOIN tbl_activity a ON ea.activity_id = a.activity_id
INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
WHERE ea.entry_id=entryId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_activities_by_entry_ids` (IN `entryIdDelimitedString` VARCHAR(255))   SELECT 
	ea.entry_id as entryId,
	a.name as activityName,
	ai.url as activityIconUrl,
	ai.alt_text as activityIconAltText,
	ag.name as activityGroup,
	agi.url as activityGroupIconUrl,
	agi.alt_text as activityGroupIconAltText
FROM tbl_entry_activity ea 
INNER JOIN tbl_activity a ON ea.activity_id = a.activity_id
INNER JOIN tbl_activity_image ai ON a.icon_image_id = ai.activity_image_id
INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
INNER JOIN tbl_activity_group_image agi ON agi.activity_group_image_id = ag.icon_image_id
WHERE FIND_IN_SET(ea.entry_id, entryIdDelimitedString)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_activities_by_user_id` (IN `userId` INT)   SELECT
	a.name AS activityName,
    a.activity_id AS activityId,
	a.activity_group_id AS activityGroupId,
	ai.url AS iconUrl,
	ai.alt_text AS iconAltText
FROM tbl_activity a 
INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
WHERE a.user_id = userId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_activities_by_user_id_and_activity_names` (IN `userId` INT, IN `activityNameDelimitedString` VARCHAR(1000))   SELECT 
	a.name AS activityName,
	a.activity_id AS activityId,
	ag.activity_group_id activityGroupId ,
	ai.url AS iconUrl,
	ai.alt_text as iconAltText
FROM tbl_activity a 
INNER JOIN tbl_activity_image ai ON ai.activity_image_id = a.icon_image_id
INNER JOIN tbl_activity_group ag ON a.activity_group_id = ag.activity_group_id
WHERE a.user_id = userId 
AND FIND_IN_SET(a.name, activityNameDelimitedString)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_activity_groups_by_user_id` (IN `userId` INT)   SELECT
	ag.name AS activityGroupName,
	ag.activity_group_id AS activityGroupId,
	agi.url AS iconUrl,
	agi.alt_text AS iconAltText
FROM tbl_activity_group ag
INNER JOIN tbl_activity_group_image agi ON agi.activity_group_image_id = ag.icon_image_id 
WHERE ag.user_id = userId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_entries_by_user_id` (IN `userId` INT(11))   SELECT 
	e.entry_id as entryId,
    e.timestamp as timestamp, 
    e.notes as entryNotes, 
    m.name as mood,
    m.mood_id as moodId,
    mv.mood_valence_name as moodValence,
    ma.mood_arousal_name as moodArousal,
    mi.url as moodIconUrl, 
    mi.alt_text as moodIconAltText 
FROM tbl_entry e
INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
INNER JOIN tbl_mood_image mi ON mi.mood_image_id = m.icon_image_id
INNER JOIN tbl_mood_valence mv ON mv.mood_valence_id = m.mood_valence_id
INNER JOIN tbl_mood_arousal ma ON ma.mood_arousal_id = m.mood_arousal_id
WHERE e.user_id = userId
LIMIT 50$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_entry_by_user_id_and_entry_id` (IN `userId` INT, IN `entryId` INT)   SELECT
    e.timestamp,
    e.notes AS entryNotes,
    m.name AS mood,
    e.mood_id AS moodId,
    mi.url AS moodIconUrl,
    mi.alt_text AS moodIconAltText
FROM tbl_entry e
INNER JOIN tbl_mood m ON m.mood_id = e.mood_id
INNER JOIN tbl_mood_image mi ON m.icon_image_id = mi.mood_image_id
WHERE e.user_id=userId 
AND e.entry_id=entryId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_entry_images_by_entry_id` (IN `entryId` INT)   SELECT 
	ei.url AS url,
	ei.alt_text AS altText
FROM tbl_entry_images ei 
WHERE ei.entry_id = entryId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_entry_images_by_entry_ids` (IN `entryIdDelimitedString` VARCHAR(255))   SELECT 
	url, 
    alt_text as altText, 
    entry_id as entryId 
FROM tbl_entry_images ei 
WHERE FIND_IN_SET(ei.entry_id, entryIdDelimitedString)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_moods` ()   SELECT
	-- m.mood_id AS moodId,
	-- m.name AS moodName,
	-- m.order AS moodOrder,
	-- mi.url AS iconUrl,
	-- mi.alt_text As iconAltText
    m.mood_id AS moodId,
    m.name AS moodName,
    mv.mood_valence_name AS moodValence,
    ma.mood_arousal_name AS moodArousal,
    mi.url AS iconUrl,
    mi.alt_text AS iconAltText
FROM tbl_mood m
LEFT JOIN tbl_mood_image mi ON mi.mood_image_id = m.icon_image_id
LEFT JOIN tbl_mood_valence mv ON mv.mood_valence_id = m.mood_valence_id
LEFT JOIN tbl_mood_arousal ma ON ma.mood_arousal_id = m.mood_arousal_id$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_select_mood_by_user_id_and_mood_name` (IN `moodName` VARCHAR(255), IN `userId` INT)   SELECT mood_id AS moodId
FROM tbl_mood 
WHERE tbl_mood.name = moodName 
AND tbl_mood.user_id = userId$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_update_entry` (IN `userId` INT, IN `entryId` INT, IN `entryNotes` TEXT, IN `activityCommaDelimStr` VARCHAR(1000))   BEGIN
	START TRANSACTION;
        -- delete entry activities
        DELETE FROM tbl_entry_activity
        WHERE tbl_entry_activity.entry_id=entryId;

        INSERT INTO tbl_entry_activity 
            (
                tbl_entry_activity.entry_id, 
                tbl_entry_activity.activity_id
            )
        SELECT 
            entryId,
            a.activity_id
        FROM tbl_activity a
        WHERE a.user_id = userId 
        AND FIND_IN_SET(a.name, activityCommaDelimStr);

        UPDATE tbl_entry e 
        SET 
	    	e.notes=entryNotes
	    WHERE e.entry_id=entryId;
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_update_password` (IN `userId` INT, IN `password` VARCHAR(255))   UPDATE tbl_user u 
SET u.password = `password`
WHERE u.user_id = userId$$

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_activity`
--

INSERT INTO `tbl_activity` (`activity_id`, `name`, `icon_image_id`, `activity_group_id`, `user_id`) VALUES
(17, 'Work', 1, 9, 94),
(18, 'Exersize', 2, 9, 94),
(21, 'Cardio', 2, 11, 94),
(40, 'relationship', 2, 9, 94),
(41, 'Games', 1, 9, 94),
(42, 'Cooking', 1, 9, 94),
(43, 'Friends', 1, 9, 94),
(44, 'Project', 2, 13, 94),
(45, 'Reading', 2, 13, 94),
(46, 'Tutorial', 2, 13, 94),
(47, 'Practical', 2, 13, 94),
(48, 'Test', 2, 13, 94),
(63, 'Work', 1, 21, 119),
(64, 'Exersize', 2, 21, 119),
(65, 'Work', 1, 22, 120),
(66, 'Exersize', 2, 22, 120),
(67, 'Work', 1, 23, 121),
(68, 'Exersize', 2, 23, 121),
(99, 'Work', 1, 39, 137),
(100, 'Exersize', 2, 39, 137),
(103, 'Work', 1, 41, 139),
(104, 'Exersize', 2, 41, 139),
(113, 'Work', 1, 46, 144),
(114, 'Exersize', 2, 46, 144),
(117, 'Work', 1, 48, 146),
(118, 'Exersize', 2, 48, 146),
(119, 'Work', 1, 49, 147),
(120, 'Exersize', 2, 49, 147),
(123, 'Work', 1, 51, 149),
(124, 'Exersize', 2, 51, 149),
(127, 'Work', 1, 53, 151),
(128, 'Exersize', 2, 53, 151),
(143, 'Dogs', 9, 11, 94),
(156, 'Work', 1, 64, 162),
(157, 'Exersize', 2, 64, 162),
(160, 'cats', 13, 11, 94),
(161, 'Work', 1, 66, 164),
(162, 'Exersize', 2, 66, 164),
(163, 'Work', 1, 67, 165),
(164, 'Exersize', 2, 67, 165);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_group`
--

CREATE TABLE `tbl_activity_group` (
  `activity_group_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_image_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_activity_group`
--

INSERT INTO `tbl_activity_group` (`activity_group_id`, `name`, `icon_image_id`, `user_id`) VALUES
(9, 'Default', 1, 94),
(11, 'Exersize', 1, 94),
(13, 'Study', 1, 94),
(21, 'Default', 1, 119),
(22, 'Default', 1, 120),
(23, 'Default', 1, 121),
(39, 'Default', 1, 137),
(41, 'Default', 1, 139),
(46, 'Default', 1, 144),
(48, 'Default', 1, 146),
(49, 'Default', 1, 147),
(51, 'Default', 1, 149),
(53, 'Default', 1, 151),
(64, 'Default', 1, 162),
(66, 'Default', 1, 164),
(67, 'Default', 1, 165);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_group_image`
--

CREATE TABLE `tbl_activity_group_image` (
  `activity_group_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_activity_group_image`
--

INSERT INTO `tbl_activity_group_image` (`activity_group_image_id`, `url`, `alt_text`) VALUES
(1, '/icons/activity-groups/default.png', 'Default Activity Group Icon');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activity_image`
--

CREATE TABLE `tbl_activity_image` (
  `activity_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_activity_image`
--

INSERT INTO `tbl_activity_image` (`activity_image_id`, `url`, `alt_text`) VALUES
(1, '/icons/activities/work.png', 'ALT TEXT'),
(2, '/icons/activities/exersize.png', 'Exersize Activity Icon'),
(9, 'https://paradepets.com/.image/t_share/MTkxMzY1Nzg4NjczMzIwNTQ2/cutest-dog-breeds-jpg.jpg', 'ALT TEXT'),
(10, 'https://paradepets.com/.image/t_share/MTkxMzY1Nzg4NjczMzIwNTQ2/cutest-dog-breeds-jpg.jpg', 'ALT TEXT'),
(11, '/icons/activities/work.png', 'ALT TEXT'),
(12, '/icons/activities/work.png', 'ALT TEXT'),
(13, 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_960_720.jpg', 'ALT TEXT');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry`
--

CREATE TABLE `tbl_entry` (
  `entry_id` int(11) NOT NULL,
  `notes` text NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `mood_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_entry`
--

INSERT INTO `tbl_entry` (`entry_id`, `notes`, `timestamp`, `user_id`, `mood_id`) VALUES
(108, 'This entry was created in postman', '2023-02-01 22:30:52', 94, 9),
(109, 'oh%20it%20actually%20worked%20%3AD', '2023-02-01 22:31:22', 94, 4),
(110, 'asdf', '2023-02-04 23:38:26', 94, 3),
(111, 'will%20it%20work%3F', '2023-02-05 00:16:24', 94, 10),
(112, 'testing', '2023-02-05 09:57:59', 94, 10),
(113, 'TEST%20100', '2023-02-05 14:40:22', 94, 1),
(114, 'TEST%20101', '2023-02-06 14:40:31', 94, 2),
(115, 'TEST%20102', '2023-02-06 22:06:12', 94, 2),
(117, '', '2023-02-06 22:08:17', 94, 12),
(118, '', '2023-02-06 23:05:56', 94, 2),
(119, '', '2023-02-06 23:06:07', 94, 7),
(120, '', '2023-02-06 23:06:48', 94, 11),
(123, 'a%20hard%20day%2C%20with%20relationship%20problems', '2023-02-15 21:56:29', 94, 9),
(124, 'xyz', '2023-02-19 20:46:57', 94, 2),
(125, 'Oi%20guv', '2023-03-09 22:56:57', 94, 11),
(129, 'undefined', '2023-03-16 01:25:01', 94, 3),
(155, 'meow', '2023-03-19 10:26:11', 94, 9),
(156, 'sadfsadf', '2023-03-19 10:27:12', 94, 1),
(158, 'undefined', '2023-03-19 10:47:15', 94, 7),
(159, 'edited, changed, new, wow!', '2023-03-19 17:04:20', 94, 2),
(160, 'This%20entry%20was%20created%20in%20postman', '2023-03-19 17:09:24', 94, 2),
(169, '', '2023-03-20 12:28:19', 151, 2),
(170, 'test%20data', '2023-03-20 21:34:52', 94, 7),
(171, 'must...record...one...more...vid%20*dies*%20*pets%20doggo*', '2023-03-21 23:15:00', 94, 6),
(172, 'This entry was created in postman', '2023-03-21 23:31:16', 94, 2),
(173, 'bump%20up%20that%20visual%20chart%20hey', '2023-03-22 13:00:07', 94, 2),
(174, 'T%20MINUS%2048%20HOURS', '2023-03-22 19:24:11', 94, 12);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry_activity`
--

CREATE TABLE `tbl_entry_activity` (
  `entry_activity_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_entry_activity`
--

INSERT INTO `tbl_entry_activity` (`entry_activity_id`, `entry_id`, `activity_id`) VALUES
(253, 108, 17),
(255, 110, 18),
(257, 112, 42),
(258, 112, 45),
(267, 117, 17),
(268, 118, 17),
(269, 119, 17),
(270, 120, 45),
(281, 125, 44),
(363, 156, 46),
(394, 155, 21),
(399, 160, 18),
(401, 123, 48),
(405, 111, 17),
(406, 109, 21),
(407, 113, 17),
(408, 113, 21),
(410, 114, 17),
(411, 114, 46),
(413, 115, 17),
(414, 115, 46),
(423, 170, 17),
(456, 159, 41),
(457, 159, 45),
(459, 171, 42),
(460, 171, 44),
(461, 171, 143),
(462, 172, 17),
(463, 172, 18),
(464, 173, 18),
(466, 174, 44);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_entry_images`
--

CREATE TABLE `tbl_entry_images` (
  `entry_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL,
  `entry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_entry_images`
--

INSERT INTO `tbl_entry_images` (`entry_image_id`, `url`, `alt_text`, `entry_id`) VALUES
(3, '/image/daxface.png', 'this is a test image attached to a mood entry', 129),
(4, '/image/cat.jpg', 'TEST IMG 2', 129),
(5, '/image/daxface.png', 'TEST IMG 3', 129),
(6, '/image/cat.jpg', 'TEST IMG 4', 129),
(7, '/image/daxface.png', 'TEST IMG 5', 129),
(8, '/image/beach-dark.jpg', 'TEST IMG 6', 129);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_key`
--

CREATE TABLE `tbl_key` (
  `id` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `reason_for_use` varchar(255) NOT NULL,
  `active` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_key`
--

INSERT INTO `tbl_key` (`id`, `api_key`, `reason_for_use`, `active`) VALUES
(1, 'bd12e269-5b53-4e0c-8807-99aecdfd9120', 'allows access to all api /user and /mood endpoints', b'1'),
(3, '2b0a2aec-0724-457b-8afd-b6b18c22efb6', 'demonstrating a disabled key', b'0');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood`
--

CREATE TABLE `tbl_mood` (
  `mood_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_image_id` int(11) NOT NULL,
  `mood_valence_id` int(11) DEFAULT NULL,
  `mood_arousal_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_mood`
--

INSERT INTO `tbl_mood` (`mood_id`, `name`, `icon_image_id`, `mood_valence_id`, `mood_arousal_id`) VALUES
(1, 'Excited', 1, 1, 1),
(2, 'Happy', 2, 1, 1),
(3, 'Delighted', 3, 1, 1),
(4, 'Content', 4, 1, 0),
(5, 'Relaxed', 5, 1, 0),
(6, 'Sleepy', 6, 1, 0),
(7, 'Depressed', 7, 0, 0),
(8, 'Bored', 8, 0, 0),
(9, 'Sad', 9, 0, 0),
(10, 'Angry', 10, 0, 1),
(11, 'Nervous', 11, 0, 1),
(12, 'Tense', 12, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood_arousal`
--

CREATE TABLE `tbl_mood_arousal` (
  `mood_arousal_id` int(11) NOT NULL,
  `mood_arousal_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_mood_arousal`
--

INSERT INTO `tbl_mood_arousal` (`mood_arousal_id`, `mood_arousal_name`) VALUES
(0, 'Low Arousal'),
(1, 'High Arousal');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood_image`
--

CREATE TABLE `tbl_mood_image` (
  `mood_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `alt_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_mood_image`
--

INSERT INTO `tbl_mood_image` (`mood_image_id`, `url`, `alt_text`) VALUES
(1, '/icons/moods/excited.png', 'Awful Mood Icon'),
(2, '/icons/moods/happy.png', 'Bad Mood Icon'),
(3, '/icons/moods/delighted.png', 'Okay Mood Icon'),
(4, '/icons/moods/content.png', 'Good Mood Icon'),
(5, '/icons/moods/relaxed.png', 'Great Mood Icon'),
(6, '/icons/moods/sleepy.png', 'Sleepy Mood Icon'),
(7, '/icons/moods/depressed.png', 'Depressed Mood Icon'),
(8, '/icons/moods/bored.png', 'Bored Mood Icon'),
(9, '/icons/moods/sad.png', 'Sad Mood Icon'),
(10, '/icons/moods/angry.png', 'Angry Mood Icon'),
(11, '/icons/moods/nervous.png', 'Nervous Mood Icon'),
(12, '/icons/moods/tense.png', 'Tense Mood Icon');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_mood_valence`
--

CREATE TABLE `tbl_mood_valence` (
  `mood_valence_id` int(11) NOT NULL,
  `mood_valence_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_mood_valence`
--

INSERT INTO `tbl_mood_valence` (`mood_valence_id`, `mood_valence_name`) VALUES
(0, 'Negative'),
(1, 'Positive');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

CREATE TABLE `tbl_user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `user_icon_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_user`
--

INSERT INTO `tbl_user` (`user_id`, `username`, `password`, `email`, `user_icon_id`) VALUES
(93, 'registertest', '8b2d041f9cad1ea98bb248e9ec834b73b37dd2ff889e91603cb2b54d349bc753b7224c', 'registertest@registertest.com', 1),
(94, 'testuser1', 'ae7ebec9f9b88772d942b4ab31f2f0843ced70cd8607f25fac2f4dc12e78314d5c1c9b', 'testuser1@doggos.org', 1),
(95, 'testuser2', 'ae84482ff6e52040507930d76a3f3b3b87f58bb7d614f2cf879099e749b3f2b87ac5df', 'test@user.2', 1),
(111, 'bigdawg', 'ed4f075a4f9217e95625305723cb80c1c75d4897e5662d873119b48c64e174efd32568', 'bigdawg@bigdawg.bigdawg', 1),
(119, 'testfordeletion', '76ff5b632e9fefb82839d82faa7b0087fe15e2c6cb5c1bf10610b1471b25d059e3aa8c', 't@f.d', 1),
(120, 'randomcrap6', 'af7320feac0da772e812a63d165a0fafbd3ce45e6d972921adc12deb91b454bb8caf20', 'randomcrap@password.com', 1),
(121, 'randomcrap7', '03c5720c5d28b696d95b66219bbd38e0db341205d4d22d239df597686da91edbeecc58', 'q@q.q', 1),
(137, 'bigratbigrat', 'b4c672b29d41aafcdb1f03f5214c7d0a25a04059fb18f6be554cba232c72ce1fd6d0c5', 'q@Q.sdfsdfdsff', 1),
(139, 'qqqqqqqqqqqq', 'a01685112720313809102de34579aaaf43e9c00d761d75b6b6871775dba27df4cf4ff4', 'sdfsd@sdfsd.sdf', 1),
(144, 'username1', 'd2abea6f0d4566cb393cf4f3bd780f621198c452456ff8623dd5dd021df9a67323d493', 'username@password.com', 1),
(146, 'qqqqqqqq', 'caf9a1d8ae7face96a1f1118d70aba998b618ad3ee2452fb40113d3a886f237b3e7d8d', 'dsaas@adsfasdf.adsf', 1),
(147, 'qqqqqqqqy', 'fe2e0b88a07b3084686f371dd2d98ef7aa320a5a510b840892fead547e4d459819ef2a', 'dfsd@gdfgdf.asdas', 1),
(149, 'qqqqqqqq2', '34ec50a22134a6363be60aa3e37c33110902c9b13e7f7313eb66477eb570c6232f3384', 'sdf@sdfsdf.sdfsdf', 1),
(151, 'qqqqqqqq6', '709a15c47bc5104ab66d21ce92759b37be8dbbc50dda817548527a912f05ed81e0be34', 'sadf@asdfadsf.asdf', 1),
(162, 'qweqweqwe', 'af4b9fb36c23068308fd3830e08bb8b25e0885078f5fda77456ac36fe4f12149fd8b6e', 'qwe@Qwe.qwe', 1),
(164, 'testfordeletionpm', 'd55308d8e4891a677815cf3a31b63588a9f95edd89d4a858b236f1920fc9bb9d4b36b8', 'test@email.postman', 1),
(165, 'testuser3', '58078f2664ea7b3c231faa50d59162cd50a5d4569d32d451a970648f29b11490c1f56f', 'w@sdf.qqq', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_image`
--

CREATE TABLE `tbl_user_image` (
  `user_image_id` int(11) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `altText` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_user_image`
--

INSERT INTO `tbl_user_image` (`user_image_id`, `url`, `altText`) VALUES
(1, '/icons/moods/defaultavatar.png', 'Default User Picture');

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
-- Indexes for table `tbl_key`
--
ALTER TABLE `tbl_key`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`);

--
-- Indexes for table `tbl_mood`
--
ALTER TABLE `tbl_mood`
  ADD PRIMARY KEY (`mood_id`),
  ADD KEY `FK__image__image_id` (`icon_image_id`),
  ADD KEY `FK__mood_valence__mood_valence_id` (`mood_valence_id`),
  ADD KEY `FK__mood_arousal__mood_arousal_id` (`mood_arousal_id`);

--
-- Indexes for table `tbl_mood_arousal`
--
ALTER TABLE `tbl_mood_arousal`
  ADD PRIMARY KEY (`mood_arousal_id`);

--
-- Indexes for table `tbl_mood_image`
--
ALTER TABLE `tbl_mood_image`
  ADD PRIMARY KEY (`mood_image_id`);

--
-- Indexes for table `tbl_mood_valence`
--
ALTER TABLE `tbl_mood_valence`
  ADD PRIMARY KEY (`mood_valence_id`);

--
-- Indexes for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `FK__user_image__user_image_id` (`user_icon_id`);

--
-- Indexes for table `tbl_user_image`
--
ALTER TABLE `tbl_user_image`
  ADD PRIMARY KEY (`user_image_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_activity`
--
ALTER TABLE `tbl_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `tbl_activity_group`
--
ALTER TABLE `tbl_activity_group`
  MODIFY `activity_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `tbl_activity_group_image`
--
ALTER TABLE `tbl_activity_group_image`
  MODIFY `activity_group_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_activity_image`
--
ALTER TABLE `tbl_activity_image`
  MODIFY `activity_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_entry`
--
ALTER TABLE `tbl_entry`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT for table `tbl_entry_activity`
--
ALTER TABLE `tbl_entry_activity`
  MODIFY `entry_activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=467;

--
-- AUTO_INCREMENT for table `tbl_entry_images`
--
ALTER TABLE `tbl_entry_images`
  MODIFY `entry_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_key`
--
ALTER TABLE `tbl_key`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_mood`
--
ALTER TABLE `tbl_mood`
  MODIFY `mood_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `tbl_mood_arousal`
--
ALTER TABLE `tbl_mood_arousal`
  MODIFY `mood_arousal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tbl_mood_image`
--
ALTER TABLE `tbl_mood_image`
  MODIFY `mood_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_mood_valence`
--
ALTER TABLE `tbl_mood_valence`
  MODIFY `mood_valence_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tbl_user`
--
ALTER TABLE `tbl_user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `tbl_user_image`
--
ALTER TABLE `tbl_user_image`
  MODIFY `user_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  ADD CONSTRAINT `FK__mood_arousal__mood_arousal_id` FOREIGN KEY (`mood_arousal_id`) REFERENCES `tbl_mood_arousal` (`mood_arousal_id`),
  ADD CONSTRAINT `FK__mood_image__mood_image_id` FOREIGN KEY (`icon_image_id`) REFERENCES `tbl_mood_image` (`mood_image_id`),
  ADD CONSTRAINT `FK__mood_valence__mood_valence_id` FOREIGN KEY (`mood_valence_id`) REFERENCES `tbl_mood_valence` (`mood_valence_id`);

--
-- Constraints for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD CONSTRAINT `FK__user_image__user_image_id` FOREIGN KEY (`user_icon_id`) REFERENCES `tbl_user_image` (`user_image_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
