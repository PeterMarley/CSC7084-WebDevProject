-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2023 at 01:07 AM
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_delete_entry` (IN `userId` INT, IN `entryId` INT)   BEGIN
    DELETE FROM tbl_entry_activity
    WHERE tbl_entry_activity.entry_id = entryId;
    
    DELETE FROM tbl_entry_images
    WHERE tbl_entry_images.entry_id = entryId;
    
    DELETE FROM tbl_entry
	WHERE tbl_entry.entry_id = entryId;    
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_insert_entry` (IN `userId` INT, IN `moodName` VARCHAR(255), IN `notes` TEXT, IN `activityNameCommaDelimStr` VARCHAR(1000))   BEGIN
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

    COMMIT;
END$$

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
(42, 'Dogs', 1, 9, 94),
(43, 'Friends', 1, 9, 94),
(44, 'Project', 2, 13, 94),
(45, 'Reading', 2, 13, 94),
(46, 'Tutorial', 2, 13, 94),
(47, 'Practical', 2, 13, 94),
(48, 'Test', 2, 13, 94);

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
(13, 'Study', 1, 94);

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
(1, '/icons/activities/work.png', 'Work Activity Icon'),
(2, '/icons/activities/exersize.png', 'Exersize Activity Icon');

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
(109, 'oh it actually worked :D', '2023-02-01 22:31:22', 94, 4),
(110, 'asdf', '2023-02-04 23:38:26', 94, 3),
(111, 'will it work?', '2023-02-05 00:16:24', 94, 10),
(112, 'testing', '2023-02-05 09:57:59', 94, 10),
(113, 'TEST 100', '2023-02-05 14:40:22', 94, 1),
(114, 'TEST 101', '2023-02-06 14:40:31', 94, 2),
(115, 'TEST 102', '2023-02-06 22:06:12', 94, 2),
(116, '', '2023-02-06 22:07:45', 94, 10),
(117, '', '2023-02-06 22:08:17', 94, 12),
(118, '', '2023-02-06 23:05:56', 94, 2),
(119, '', '2023-02-06 23:06:07', 94, 7),
(120, '', '2023-02-06 23:06:48', 94, 11),
(122, 'abc', '2023-02-15 19:03:51', 94, 9),
(123, 'a hard day, with relationship problems', '2023-02-15 21:56:29', 94, 9),
(124, 'reconciliation! edit', '2023-02-19 20:46:57', 94, 2),
(125, '&lt;&gt;!&#x27;@', '2023-03-09 22:56:57', 94, 11);

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
(254, 109, 21),
(255, 110, 18),
(256, 111, 17),
(257, 112, 42),
(258, 112, 45),
(259, 113, 17),
(260, 113, 21),
(261, 114, 17),
(262, 114, 46),
(263, 115, 17),
(264, 115, 46),
(265, 116, 42),
(266, 116, 45),
(267, 117, 17),
(268, 118, 17),
(269, 119, 17),
(270, 120, 45),
(275, 122, 17),
(276, 122, 44),
(277, 123, 48),
(280, 124, 48),
(281, 125, 44);

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
(1, 'bd12e269-5b53-4e0c-8807-99aecdfd9120', 'allows access to all api endpoints', b'1'),
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
(94, 'randomcrap2', '118762a7b952eb3214f5f69244bef99fa2ea5a1a781eaa9c384eb3e81ea76316e470fd', 'randomcrap@doggos2.org', 1),
(95, 'lawdyjesus', 'ae84482ff6e52040507930d76a3f3b3b87f58bb7d614f2cf879099e749b3f2b87ac5df', 'lawdyjesus@lawdyjesus', 1),
(111, 'bigdawg', 'ed4f075a4f9217e95625305723cb80c1c75d4897e5662d873119b48c64e174efd32568', 'bigdawg@bigdawg.bigdawg', 1);

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
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `tbl_activity_group`
--
ALTER TABLE `tbl_activity_group`
  MODIFY `activity_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_activity_group_image`
--
ALTER TABLE `tbl_activity_group_image`
  MODIFY `activity_group_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_activity_image`
--
ALTER TABLE `tbl_activity_image`
  MODIFY `activity_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_entry`
--
ALTER TABLE `tbl_entry`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `tbl_entry_activity`
--
ALTER TABLE `tbl_entry_activity`
  MODIFY `entry_activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=282;

--
-- AUTO_INCREMENT for table `tbl_entry_images`
--
ALTER TABLE `tbl_entry_images`
  MODIFY `entry_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

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
