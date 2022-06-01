const http = require('./app');
const sockets = require('./config/socket-config');
require('./config/redis-config');
const port = process.env.PORT || 3000;
const debugLib = require('debug');

const logger = debugLib('yck:startSever')

sockets.on("connection", socket => {
	logger(`User ${socket.id} connected by socket`);
    socket.on("setDevice", deviceId => {
        socket.join(deviceId)
        logger(`User ${socket.id} connected to device ${deviceId}`);
    })
    module.exports = socket;
})

module.exports = http.listen(port, function () {
    logger(`App listening on port: ${port} In environment: ${process.env.NODE_ENV}`);
});
