const axios = require('axios');

function emitData(data, callback) {
    const privateSocket = require('../server')
    privateSocket.emit('datos', data)
    return callback(null, "OK")
}

function sendAlarm(time, callback) {
    const hora = time.substr(0,2);
    const min = time.substr(3,4);
    const alarma = hora+min
    console.log(`La alarma a configurar es: ${alarma}`);
    var config = {
        method: 'post',
        url: process.env.URL_THINGERIO,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': process.env.TOKEN_THINGERIO
        },
        data: {
            "in" : alarma
        }
    };
    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        return callback(null, response)
    })
    .catch(function (error) {
        console.log(error);
        return callback(error, null)
    });
}

module.exports = {
    "emitData": emitData,
    "sendAlarm": sendAlarm
}
