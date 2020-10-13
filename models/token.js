const common = require('../config/common-functions')
const jwt = require('jsonwebtoken')

function verifyToken(token, callback){
    jwt.verify(token, process.env.KEY_TOKEN, function(err, decoded){
        if(err){
            console.log(common.getDateTime()+":--------------------- TOKEN EXPIRADO -----------------------\n")
            return callback(err, null)
        }else{
            console.log(common.getDateTime()+":--------------------- TOKEN VALIDADO -----------------------\n")
            return callback(null, decoded)
        }
    })
}

function createToken(tokenData, callback){
	jwt.sign(tokenData, process.env.KEY_TOKEN, {expiresIn: 60*60}, function(err, newToken){
		if(err){
			console.log(common.getDateTime()+":-------------------- TOKEN NO CREADO -----------------------\n")
			console.log(err)
			return callback(err, null)
		}else{

			console.log(common.getDateTime()+":---------------------- TOKEN CREADO ------------------------\n")
			return callback(null, newToken)
		}
	})	
}

function updateToken(token, callback){
    let self = this
    self.verifyToken(token, function(err, decoded){
        if(err){
            return callback(err, null)
        }else{
            var tokenData = {
                email: decoded.email,
                contra: decoded.contra
            }
            self.createToken(tokenData, function(err, newToken){
                if(err){
                    return callback(err, null)
                }else{
                    return callback(null, newToken)
                }
            })
        }
    })	
}

module.exports = {
    "verifyToken": verifyToken,
    "updateToken": updateToken,
    "createToken": createToken
}