// SERVIDOR EXPRESS + SOCKET.IO

// Importa las librerías necesarias

import express from 'express'
import logger from 'morgan'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

// Configura variables de entorno

dotenv.config()

// Define el puerto del servidor

const port = process.env.PORT ?? 3000

// Crea la aplicación Express

const app = express()

// Crea el servidor HTTP con Express

const server = createServer(app)

// Crea una instancia de Socket.IO en el servidor

const io = new Server(server, { connectionStateRecovery: {} })

// Conecta a la base de datos MySQL

const db = await mysql.createConnection({

  host: 'localhost',
  user: 'chat',
  password: '',
  database: 'chatdb',
  port: 3306
  
})

// Crea la tabla messages en la base de datos si no existe

await db.execute('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTO_INCREMENT, content TEXT, user TEXT)')

// Evento cuando se conecta un cliente al servidor mediante Socket.IO

io.on('connection', async (socket) => {

  console.log('a user has connected!') // Imprime un mensaje cuando un usuario se conecta

  // Evento cuando un cliente se desconecta

  socket.on('disconnect', () => { console.log('an user has disconnected') }) // Imprime un mensaje cuando un usuario se desconecta

  // Evento para recibir un mensaje del cliente y guardarlo en la base de datos

  socket.on('chat message', async (msg) => {

    let result
    const username = socket.handshake.auth.username ?? 'anonymous' // Obtiene el nombre de usuario del cliente
    console.log({ username }) // Imprime el nombre de usuario en la consola

    try {

      result = await db.execute({

        sql: 'INSERT INTO messages (content, user) VALUES (?, ?)', // Inserta el mensaje en la base de datos
        values: [msg, username]

      })

    } catch (e) {

      console.error(e)
      return
      
    }

    // Emite el mensaje a todos los clientes conectados junto con su ID, nombre de usuario

    io.emit('chat message', msg, result[0].insertId.toString(), username)

  })

  // Recupera mensajes del historial para un nuevo cliente que se conecta

  if (!socket.recovered) {

    try {

      const [results] = await db.execute('SELECT id, content, user FROM messages WHERE id > ?', [socket.handshake.auth.serverOffset ?? 0])

      // Emite mensajes recuperados al cliente recién conectado

      results.forEach(row => { socket.emit('chat message', row.content, row.id.toString(), row.user) })
    } catch (e) { console.error(e) }

  }

})

// Configura el middleware de registro de solicitudes HTTP

app.use(logger('dev'))

// Sirve archivos estáticos desde la carpeta 'client'

app.use(express.static(process.cwd() + '/client'))

// Ruta principal que sirve el archivo index.html

app.get('/', (req, res) => { res.sendFile(process.cwd() + '/client/index.html') })

// Inicia el servidor en el puerto especificado

server.listen(port, () => { console.log(`Server running on port ${port}`) }) // Imprime un mensaje cuando el servidor se inicia
