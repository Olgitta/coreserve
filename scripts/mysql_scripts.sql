DROP DATABASE IF EXISTS `devel`;
CREATE DATABASE `devel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION = 'N' */;

USE `devel`;

-- Create the 'posts' table
CREATE TABLE IF NOT EXISTS posts
(
    id    INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes      INT       DEFAULT 0
);

-- Create the 'comments' table
CREATE TABLE IF NOT EXISTS comments
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    post_id           INT  NOT NULL,
    parent_comment_id INT       DEFAULT NULL, -- Used for replies
    content           TEXT NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes             INT       DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE users
(
    id         INT AUTO_INCREMENT PRIMARY KEY,                                 -- Primary key
    name       VARCHAR(255) NOT NULL,                                          -- User's name
    email      VARCHAR(255) NOT NULL UNIQUE,                                   -- User's email, must be unique
    guid       BINARY(16)   NOT NULL UNIQUE,                                   -- Auto-generated GUID, indexed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                            -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of last update
);

-- Trigger to auto-generate GUID on insert
DELIMITER $$
CREATE TRIGGER before_users_insert
    BEFORE INSERT
    ON users
    FOR EACH ROW
BEGIN
    SET NEW.guid = UUID_TO_BIN(UUID()); -- Convert UUID to binary format
END$$
DELIMITER ;
