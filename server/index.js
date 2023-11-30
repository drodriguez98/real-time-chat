// SERVIDOR EXPRESS + SOCKET.IO

// Importa las librerías necesarias

import express from 'express'
import logger from 'morgan'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

// Cargar y configurar las variables de entorno definidas en el archivo .env

dotenv.config()

// Definir el puerto del servidor.

const port = process.env.PORT ?? 3000

// Crear el servidor HTTP con Express. 
// Permite manejar las rutas, las solicitudes HTTP y configurar la lógica de la aplicación (gestión de solicitudes, respuestas, middleware...).
// Crear una instancia de Socket.IO en el servidor con reconexión y restauración de estado en caso de desconexiones intermitentes.

const app = express()
const server = createServer(app)
const io = new Server(server, { connectionStateRecovery: {} })

// Conectar a la base de datos MySQL y crear la tabla messages en la base de datos si no existe.

const db = await mysql.createConnection({

  host: 'localhost',
  user: 'chat',
  password: '',
  database: 'chatdb',
  port: 3306

})

await db.execute('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTO_INCREMENT, content TEXT, user TEXT)')

// Evento cuando se conecta un cliente al servidor mediante Socket.IO

io.on('connection', async (socket) => {

  console.log('new user connected!') 
  socket.on('disconnect', () => { console.log('user disconnected') }) 

  // Evento cuando el servidor recibe un mensaje desde el cliente.

    // Obtiene el nombre de usuario del handshake inicial del cliente emisor.
    // Guarda el mensaje en la base de datos.
    // Reenvia el mensaje a todos los clientes conectados junto con su ID y nombre de usuario.

  socket.on('chat message', async (msg) => {

    const username = socket.handshake.auth.username ?? 'anonymous' // console.log({ username }) 
    
    let result

    try {

      result = await db.execute({

        sql: 'INSERT INTO messages (content, user) VALUES (?, ?)',
        values: [msg, username]

      })

    } catch (e) {

      console.error(e)
      return
      
    }

    io.emit('chat message', msg, result[0].insertId.toString(), username)

  })

  // Recuperar y emitir mensajes recuperados del historial a un cliente recién conectado.

  if (!socket.recovered) {

    try {

      const [results] = await db.execute('SELECT id, content, user FROM messages WHERE id > ?', [socket.handshake.auth.serverOffset ?? 0])

      results.forEach(row => { socket.emit('chat message', row.content, row.id.toString(), row.user) })

    } catch (e) { console.error(e) }

  }

})

// Configurar el middleware de registro de solicitudes HTTP (morgan)

app.use(logger('dev'))

// Servir archivos estáticos (html, css...) desde la carpeta 'client'

app.use(express.static(process.cwd() + '/client'))

// Añadir ruta principal que sirve el archivo index.html

app.get('/', (req, res) => { res.sendFile('index.html') })

// Iniciar el servidor en el puerto especificado

server.listen(port, () => { console.log(`Server running on port ${port}`) })
