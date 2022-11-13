BEGIN
	DECLARE encryptedPassword VARBINARY(255);
    DECLARE userId INT(11);
    INSERT INTO tbl_user (tbl_user.username, tbl_user.password)
    VALUES (username, fn_Encrypt_Password(pw, NULL));
    
    SET userId = LAST_INSERT_ID();
    
    INSERT INTO tbl_mood (tbl_mood.name, tbl_mood.order, tbl_mood.icon_image_id, tbl_mood.user_id)
    VALUES 
    	('Awful', 1, '', userId),
        ('Bad', 1, '', userId),
        ('OK', 1, '', userId),
        ('Good', 1, '', userId),
        ('Great', 1, '', userId);
        
    INSERT INTO tbl_activity_group (tbl_activity_group.name, tbl_activity_group.icon_image_id)
    VALUES 
    	('Family', ''),
        ('Friends', ''),
        ('Work', '');
        
    INSERT INTO tbl_activity 
    	(
            tbl_activity.name, 
            tbl_activity.icon_image_id, 
            tbl_activity.activity_group_id, 
            tbl_activity.user_id
        )
    VALUES 
    	('Chatting to friends', ''),
        ('Chatting to family', ''),
        ('Working', '');
END