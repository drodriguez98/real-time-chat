import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'chat',
  port: 3306,
  password: '',
  database: 'chatdb'
}
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

const port = process.env.PORT ?? 3000

const app = express()

app.use(express.static('client'))

const server = createServer(app)

const io = new Server(server, {
  connectionStateRecovery: {}
})

io.on('connection', (socket) => {
  console.log('new user connected!')
  socket.on('disconnect', () => { console.log('user disconnected') })
  socket.on('chat message', async (msg) => {
    io.emit('chat message', msg) // Emite el mensaje a todos los clientes

    try {
      await connection.query('INSERT INTO messages (content) VALUES (?)', [msg]) // Inserta el mensaje en la base de datos
    } catch (error) {
      console.error('Error inserting message into the database:', error)
    }
  })
})

app.use(logger('dev'))

app.get('/', (req, res) => { res.sendFile(process.cwd() + '/client/index.html') })

server.listen(port, () => { console.log(`Server running on port ${port}`) })
