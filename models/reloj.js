const axios = require('axios');

function emitData(data, deviceId) {
    return new Promise((resolve, reject) => {
        if(!data.temp_amb || !data.temp_local || !deviceId){
            reject({
                body: {
                    msg: "Faltaron datos, por favor valide la informacion",
                    code: 310
                },
                statusCode: 400
            })
        }else{
            const globalSocket = require('../config/socket-config')
            const privateSocket = require('../server')
            globalSocket.to(deviceId).emit('datos', data)
            resolve()
        }
    })
}

function sendAlarm(time) {
    return new Promise((resolve, reject) => {
        const hora = time.substr(0,2);
        const min = time.substr(3,4);
        const alarma = hora+min
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
            resolve(response.data)
        })
        .catch(function (error) {
            reject({
                body: {
                    msg: "Error al intentar configurar la alarma",
                    code: 401,
                    info: error.message
                },
                statusCode: 500
            })
        });
    })
}

module.exports = {
    "emitData": emitData,
    "sendAlarm": sendAlarm
}
