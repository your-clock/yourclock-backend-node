const redis = require('redis')

const client = redis.createClient({
    port: process.env.PORT_REDIS,
    host: process.env.HOST_REDIS
})

client.on('connect', () => {
    console.log('Client connected to redis.');
})

client.on('ready', () => {
    console.log('Client connected to redis and ready to use.');
})

client.on('error', (err) => {
    console.log('Error in Redis: '+err.message);
})

client.on('end', () => {
    console.log('Client disconnected from redis.');
})

process.on('SIGNINT', () => {
    client.quit()
})

module.exports = client
