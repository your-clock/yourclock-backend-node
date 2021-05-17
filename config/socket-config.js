const http = require('../app')
const socketio = require('socket.io')(http, {
    cors: {
        origin: process.env.HOST_FRONT,
        methods: ["GET", "POST"],
        transports: ['websocket'],
        credentials: true
    },
    allowEIO3: true
})

module.exports = socketio
