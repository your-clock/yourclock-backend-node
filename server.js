const http = require('./app')
const socketio = require('./config/socket-config')
require('./config/redis-config')
const port = process.env.PORT || 3000;

socketio.on("connection", socket => {
	console.log(`Usuario ${socket.id} conectado por socket`)
    socket.on("setDevice", deviceId => {
        socket.join(deviceId)
        console.log(`Usuario ${socket.id} conectado al dispositivo ${deviceId}`);
    })
    module.exports = socket;
})

module.exports = http.listen(port, function () {
    console.log(`App listening on port: ${port} In environment: ${process.env.NODE_ENV}`);
});
