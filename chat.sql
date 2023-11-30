DROP DATABASE IF EXISTS moviesdb;

CREATE DATABASE moviesdb;

USE moviesdb;

CREATE TABLE IF NOT EXISTS  messages ( id INTEGER PRIMARY KEY AUTO_INCREMENT, content TEXT )

CREATE USER 'chat'@'localhost' IDENTIFIED BY ''; -- Crea el usuario sin contraseña

GRANT ALL PRIVILEGES ON *.* TO 'chat'@'localhost' WITH GRANT OPTION;