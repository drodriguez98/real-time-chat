-- SCRIPT PARA CREAR LA BASE DE DATOS

-- Elimina la base de datos si existe y crea una nueva llamada chatdb

DROP DATABASE IF EXISTS chatdb;
CREATE DATABASE chatdb;
USE chatdb;

-- Crea una tabla llamada messages con columnas id, content y user

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  content TEXT,
  user VARCHAR(255)
)

-- Crea un usuario 'chat' sin contraseña

CREATE USER 'chat'@'localhost' IDENTIFIED BY '';

-- Otorga todos los privilegios al usuario 'chat' en cualquier base de datos

GRANT ALL PRIVILEGES ON *.* TO 'chat'@'localhost' WITH GRANT OPTION;