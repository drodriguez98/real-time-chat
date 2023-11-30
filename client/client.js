import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

// Obtener el nombre de usuario almacenado localmente.

const getUsername = async () => {

    const username = localStorage.getItem('username')
    
    if (username) {

        console.log(`User existed ${username}`) 
        return username

    }

    // Si no hay nombre de usuario almacenado, obtener uno aleatorio de una API y almacenarlo localmente.

    const res = await fetch('https://random-data-api.com/api/users/random_user')
    const { username: randomUsername } = await res.json() 

    localStorage.setItem('username', randomUsername) 

    return randomUsername
}

// Inicializar un socket de conexión usando Socket.IO con autenticación, estableciendo el desfase del servidor inicialmente en 0.

const socket = io({

    auth: {

        username: await getUsername(),
        serverOffset: 0 

    }

})

// Obtener elementos del DOM necesarios para el chat.

const form = document.getElementById('form')
const input = document.getElementById('input') 
const messages = document.getElementById('messages') 

// Recibir mensajes del servidor. 
// Crea una nueva entrada de mensaje HTML con el contenido recibido, actualiza el desfase y hace scroll hacia abajo para mostrar el último mensaje.

socket.on('chat message', (msg, serverOffset, username) => {

    const item = `<li>

        <p>${msg}</p>
        <small>${username}</small>

    </li>`

    messages.insertAdjacentHTML('beforeend', item) 
    socket.auth.serverOffset = serverOffset
    messages.scrollTop = messages.scrollHeight

})

// Enviar mensajes al servidor desde el formulario a través del socket.

form.addEventListener('submit', (e) => {

    e.preventDefault() // Evita el comportamiento predeterminado del formulario

    if (input.value) {

        socket.emit('chat message', input.value)
        input.value = '' 

    }

})