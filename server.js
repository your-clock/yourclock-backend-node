const http = require('./app')
const socketio = require('./config/socket-config')
require('./config/redis-config')
const port = 3000 || process.env.PORT;

socketio.on("connection", socket => {
	console.log(`Usuario conectado por socket, id: ${socket.id}`)
    module.exports = socket
})

module.exports = http.listen(port, function () {
    console.log(`App listening on port: ${port} In environment: ${process.env.NODE_ENV}`);
});
