const jwt = require('jsonwebtoken');
const redis = require('../config/redis-config');
const { v4: uuidv4 } = require('uuid');
const debugLib = require('debug');
const logger = debugLib('yck:tokenService');

function verifyToken(token){
    return new Promise((resolve, reject) => {
        const decode = jwt.verify(token, process.env.KEY_TOKEN)
        redis.GET(decode.uuid, (errRedis, result) => {
            if(errRedis){
                reject({
                    body: {
                        msg: "Ha ocurrido un error al obtener la llave en redis",
                        code: 304,
                        info: errRedis
                    },
                    statusCode: 500
                })
            }else if(!result){
                resolve(false)
            }else{
                resolve(true)
            }
        })
    })
}

function createToken(tokenData){
    return new Promise((resolve, reject) => {
        const payload = {
            uuid: uuidv4()
        }
        const result = jwt.sign(payload, process.env.KEY_TOKEN);
        redis.SETEX(payload.uuid, 60*30, JSON.stringify(tokenData), (err) => {
            if(err){
                reject({
                    body: {
                        msg: "Ha ocurrido un error al guardar la llave en redis",
                        code: 304,
                        info: err
                    },
                    statusCode: 500
                })
            }else{
                resolve(result)
            }
        })
    })
}

function updateToken(tokenReq){
    return new Promise((resolve, reject) => {
        const decode = jwt.verify(tokenReq, process.env.KEY_TOKEN)
        redis.GET(decode.uuid, (errRedis, result) => {
            if(errRedis){
                reject({
                    body: {
                        msg: "Ha ocurrido un error al obtener la llave en redis",
                        code: 304,
                        info: errRedis
                    },
                    statusCode: 500
                })
            }else if(!result){
                reject({
                    body: {
                        msg: "Su token se ha vencido, ingrese de nuevo",
                        code: 304
                    },
                    statusCode: 500
                })
            }else{
                redis.SETEX(decode.uuid, 60*30, result, (err) => {
                    if(err){
                        reject({
                            body: {
                                msg: "Ha ocurrido un error al guardar la llave en redis",
                                code: 304,
                                info: err
                            },
                            statusCode: 500
                        })
                    }else{
                        resolve()
                    }
                })
            }
        })
    })
}

function deleteToken(token) {
    return new Promise((resolve, reject) => {
        const decode = jwt.verify(token, process.env.KEY_TOKEN)
        redis.DEL(decode.uuid, (err, result) => {
            if(err){
                reject({
                    body: {
                        msg: "Ha ocurrido un error al eliminar la llave en redis",
                        code: 304,
                        info: err
                    },
                    statusCode: 500
                })
            }else{
                resolve(result)
            }
        })
    })
}

module.exports = {
    "verifyToken": verifyToken,
    "updateToken": updateToken,
    "createToken": createToken,
    "deleteToken": deleteToken
}
