DROP DATABASE IF EXISTS `devel`;
CREATE DATABASE `devel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION = 'N' */;

USE `devel`;

DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL, -- Store password securely (e.g., hashed)
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into users (name, email, password)
values ('main', 'main@mail', 'mainpassword');

CREATE TABLE posts
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL, -- References the user who created the post
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes       INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE comments
(
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL, -- References the user who created the comment
    post_id            INT NOT NULL, -- References the post this comment belongs to
    parent_id  INT DEFAULT NULL, -- NULL indicates a top-level comment
    content            TEXT NOT NULL,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes              INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
);

# Trigger to auto-generate GUID on insert
# DELIMITER $$
# CREATE TRIGGER before_users_insert
#     BEFORE INSERT
#     ON users
#     FOR EACH ROW
# BEGIN
#     SET NEW.guid = UUID_TO_BIN(UUID()); -- Convert UUID to binary format
# END$$
# DELIMITER ;
