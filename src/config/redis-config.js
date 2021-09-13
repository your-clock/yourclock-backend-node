const debugLib = require('debug')

const logger = debugLib('yck:startRedis')

var client;
if(process.env.NODE_ENV === "test"){
    const redis = require("redis-mock")
    client = redis.createClient();
}else{
    const redis = require('redis');
    client = redis.createClient({
        port: process.env.PORT_REDIS,
        host: process.env.HOST_REDIS,
        password: process.env.PWD_REDIS
    })
}

client.on('connect', () => {
    logger('Client connected to redis.');
})

client.on('ready', () => {
    logger('Client connected to redis and ready to use.');
})

client.on('error', (err) => {
    logger('Error in Redis: %o', err.message);
})

client.on('end', () => {
    logger('Client disconnected from redis.');
})

process.on('SIGNINT', () => {
    client.quit()
})

module.exports = client
