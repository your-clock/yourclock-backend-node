const Auth = require('../../models/users');
const joi = require('joi')
const path = require('path')

const schemaLogin = joi.object({
    name1: joi.string().min(1).required(),
    name2: joi.string().min(1).allow(""),
    lastName1: joi.string().min(1).required(),
    lastName2: joi.string().min(1).allow(""),
    mail: joi.string().min(6).required().email(),
    pass: joi.string().min(8).required(),
    city: joi.string().min(1).required(),
    googleId: joi.string().min(6)
})

const schemaAuth = joi.object({
    mail: joi.string().min(6).required().email(),
    pass: joi.string().min(8).required(),
})

exports.userLogin = (req, res) => {

	let userInfo = req.body

    const {error} = schemaLogin.validate(userInfo);
    if (error) {
        return res.json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 305,
            msg: "Por favor revise su "+error.details[0].context.key
        }) 
    }

    Auth.findByEmail(userInfo.mail, function(err, userExist){
        if(err){
            return res.json({
                code: 400,
                msg: "Error, compruebe su conexion e intentelo de nuevo"
            })
        }else if(userExist){
            return res.json({
                msg: "Usuario ya existente, intentelo de nuevo",
                code: 304
            })
        }
        var mailOptions = {
            from: 'no-reply@yourclock-app.com',
            to: userInfo.mail,
            subject: 'Verificacion cuenta en Your Clock'
        }
        var plantilla = path.join(__dirname, '../..', 'views/verification.html')
        var datos = {
            nombre: userInfo.name1,
            apellido: userInfo.lastName1,
            email: Buffer.from(userInfo.mail).toString('base64'),
            base_url: process.env.HOST_FRONT
        }
        Auth.sendEmailToUser(mailOptions, plantilla, datos, function(err){
            if(err){
                return res.json({
                    msg: "Error al enviar el correo, verifique su conexion, si el error persiste, intente mas tarde",
                    code: 402
                })
            }
            Auth.createUser(userInfo, function(err){
                if(err){
                    return res.json({
                        msg: "Error, compruebe su conexion e intentelo de nuevo",
                        code: 400
                    })
                }
                return res.json({
                    msg: "Usuario registrado correctamente, verifique su correo para autenticar su cuenta",
                    code: 300
                })
            })
        })
    })				
}

exports.authUser = (req, res) => {

	let userInfo = req.body

	const {error} = schemaAuth.validate(userInfo);
    if (error) {
        return res.status(400).json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 305,
            msg: "Por favor revise su "+error.details[0].context.key
        }) 
    }

    Auth.findByEmail(userInfo.mail, function(err, userExist){
        if(err){
            return res.json({
                msg: "Error, compruebe su conexion e intentelo de nuevo",
                code: 400
            })
        }else if(!userExist){
            return res.json({
                msg: "Correo incorrecto, intentelo de nuevo",
                code: 307
            })
        }
        Auth.authenticateUser(userExist.estado, userExist.password, userInfo.pass, function(verified, authenticated){
            if(verified && authenticated){
                res.json({
                    code: 300,
                    msg: "Usuario autenticado exitosamente",
                    infoClient: {
                        nombre: Buffer.from(userExist.nombre1).toString('base64'),
                        correo: Buffer.from(userExist.correo).toString('base64'),
                        id: Buffer.from(userExist._id.toString()).toString('base64')
                    }
                })
            }else if(!verified && authenticated){
                res.json({
                    msg: "contraseña incorrecta, intentelo de nuevo",
                    code: 306
                })
            }else if(!verified && !authenticated){
                res.json({
                    msg: "Por favor verifique su cuenta para continuar",
                    code: 308
                })
            }
        })
    })
}

exports.deleteUser = (req, res) => {

    let email = req.body.mail

	if(!email){
		console.log("faltaron datos");
		return res.json({
			msg: "Error, faltaron datos",
			code: 305
		})
	}
    email = Buffer.from(email, 'base64').toString('ascii')
    Auth.deleteUser(email, function(err){
        if(err){
            console.log("Error eliminando")
            return res.json({
                msg: "Error, compruebe su conexion e intentelo de nuevo",
                code: 400
            })
        }
        console.log("Cuenta eliminada satisfactoriamente")
        return res.json({
            msg: "Su cuenta ha sido eliminada correctamente.",
            code: 311
        })
    })
}

exports.verifyUser = (req, res) => {

	let email = req.body.mail

	if(!email){
		console.log('error, faltaron datos')
		return res.send("305")
    }
    Auth.findByEmail(Buffer.from(email, 'base64').toString('ascii'), function(err, userExist){
        if(err){
            console.log("Error consultando")
            return res.send("400")
        }else if(!userExist){
            console.log("Correo incorreto")
            return res.send("307")
        }
        if(userExist.estado == false){
            Auth.updateStateByEmail(userExist.correo, function(err){
                if(err){
                    console.log("Error consultando")
                    return res.send("400")
                }
                console.log("estado actualizado correctamente")
                return res.send("310")
            })
        }else{
            console.log('verificacion ya realizada')
            return res.send("309")
        }
    })
}

exports.forgotPasswordUser = (req, res) =>{
	var email = req.body.mail
	if(!email){
		console.log('error, faltaron datos')
		return res.send("305")
	}
    Auth.findByEmail(email, function(err, userExist){
        if(err){
            console.log("Error consultando; "+err)
            return res.send("400")
        }else if(!userExist){
            console.log("Correo incorrecto")
            return res.send("307")
        }
        let mailOptions = {
            from: 'yourclocknoreply@gmail.com',
            to: email,
            subject: 'Cambio de contraseña en Your Clock'
        };
        var plantilla = path.join(__dirname, '../..', 'views/forgotPassword.html')
        var datos = {
            nombre: userExist.nombre1,
            id: Buffer.from(userExist._id.toString()).toString('base64'),
            base_url: process.env.HOST_FRONT
        }
        Auth.sendEmailToUser(mailOptions, plantilla, datos, function(err, info){
            if(err){
                return res.send("402")
            }
            return res.send("300")
        })
    })
}

exports.recoveryPasswordUser = (req, res) => {
	var credentials = req.body
	if(!credentials.id || !credentials.pass){
		console.log('error, faltaron datos')
		return res.send("305")
	}
    Auth.updatePasswordById(credentials, function(err){
        if(err){
            console.log("Error consultando en recovery password: "+err)
            return res.send("400")
        }
        //console.log(common.getDateTime()+"----------------- CONTRASEÑA ACTUALIZADA -------------------")
        return res.send("310")
    })
}

exports.getUrlGoogle = function(req, res){
	return res.send(Auth.getGoogleUrl());
};

exports.callbackGoogle = function(req, res) {
    let correoEncoding = Buffer.from(req.user.correo).toString('base64')
    let nombreEncoding = Buffer.from(req.user.nombre1).toString('base64')
    let idEncoding = Buffer.from(req.user._id.toString()).toString('base64')
    return res.send('<script>window.location.href="'+process.env.HOST_FRONT+'/#/usergoogle/'+idEncoding+'/'+correoEncoding+'/'+nombreEncoding+'";</script>');
}