DROP DATABASE IF EXISTS chatdb;

CREATE DATABASE chatdb;

USE chatdb;

CREATE TABLE IF NOT EXISTS  messages ( id INTEGER PRIMARY KEY AUTO_INCREMENT, content TEXT, user VARCHAR(255) )

CREATE USER 'chat'@'localhost' IDENTIFIED BY ''; -- Crea el usuario sin contraseña

GRANT ALL PRIVILEGES ON *.* TO 'chat'@'localhost' WITH GRANT OPTION;