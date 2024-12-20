
DROP DATABASE IF EXISTS `devel`;
CREATE DATABASE `devel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `devel`;

CREATE TABLE todos (
                       id INT AUTO_INCREMENT PRIMARY KEY, -- Regular auto-incremented ID
                       guid CHAR(24) NOT NULL UNIQUE, -- GUID column with unique constraint
                       title VARCHAR(255) NOT NULL, -- Adjust length based on expected title size
                       completed BOOLEAN NOT NULL DEFAULT FALSE, -- Tracks whether the todo is completed
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Automatically records creation time
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL -- Automatically updates timestamp on modification
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
