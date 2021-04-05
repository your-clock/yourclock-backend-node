const common = require('../config/common-functions')
const jwt = require('jsonwebtoken')
const redis = require('../config/redis-config')
import { v4 as uuidv4 } from 'uuid';

function verifyToken(uuid, callback){
    redis.GET(uuid, (errRedis, result) => {
        if(errRedis){
            return callback(errRedis, null)
        }
        jwt.verify(result, process.env.KEY_TOKEN, function(err, decoded){
            if(err){
                console.log(common.getDateTime()+":--------------------- TOKEN EXPIRADO -----------------------\n")
                return callback(err, null)
            }
            console.log(common.getDateTime()+":--------------------- TOKEN VALIDADO -----------------------\n")
            return callback(null, decoded)
        })
        return callback("Ha ocurrido un error inesperado", null)
    })
}

function createToken(tokenData, callback){
    if(!tokenData.uuid){
        tokenData.uuid = uuidv4();
    }
	jwt.sign(tokenData, process.env.KEY_TOKEN, {expiresIn: 60*60}, function(err, newToken){
		if(err){
			console.log(common.getDateTime()+":-------------------- TOKEN NO CREADO -----------------------\n")
			console.log(err)
			return callback(err, null)
		}
        console.log(common.getDateTime()+":---------------------- TOKEN CREADO ------------------------\n")
        redis.SETEX(tokenData.uuid, 60*30, newToken)
        return callback(null, tokenData.uuid)
	})
}

function updateToken(uuidReq, callback){
    const self = this
    self.verifyToken(uuidReq, function(err, decoded){
        if(err){
            return callback(err, null)
        }
        const tokenData = {
            nombre: decoded.nombre,
            correo: decoded.correo,
            id: decoded.id,
            uuid: decoded.uuid
        }
        self.createToken(tokenData, function(errorCreate, uuid){
            if(errorCreate){
                return callback(errorCreate, null)
            }
            return callback(null, uuid)
        })
        return callback("Ha ocurrido un error inesperado", null)
    })
}

function deleteToken(uuid, callback) {
    redis.DEL(uuid, (err, result) => {
        if(err){
            return callback(err, null)
        }
        return callback(null, result)
    })
}

module.exports = {
    "verifyToken": verifyToken,
    "updateToken": updateToken,
    "createToken": createToken,
    "deleteToken": deleteToken
}
