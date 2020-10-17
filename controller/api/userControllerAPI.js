const Auth = require('../../models/users');
const token = require('../../models/token')
const joi = require('joi')

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
        return res.status(400).json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 305,
            msg: "Por favor revise su "+error.details[0].context.key
        }) 
    }

    Auth.findByEmail(userInfo.mail, function(err, userExist){
        if(err){
            res.json({
                code: 400,
                msg: "Error, compruebe su conexion e intentelo de nuevo"
            })
        }else if(userExist){
            res.json({
                msg: "Usuario ya existente, intentelo de nuevo",
                code: 304
            })
        }else{
            var mailOptions = {
                from: 'no-reply@yourclock-app.com',
                to: userInfo.mail,
                subject: 'Verificacion cuenta en Your Clock',
                html: {
                        path: __dirname+`/views/verification-${process.env.NODE_ENV}.html`
                }
            }
            Auth.sendEmailToUser(mailOptions, function(err){
                if(err){
                    res.json({
                        msg: "Error al enviar el correo, verifique su conexion, si el error persiste, intente mas tarde",
                        code: 402
                    })
                }else{
                    Auth.createUser(userInfo, function(err){
                        if(err){
                            res.json({
                                msg: "Error, compruebe su conexion e intentelo de nuevo",
                                code: 400
                            })
                        }else{
                            res.json({
                                msg: "Usuario registrado correctamente, verifique su correo para autenticar su cuenta",
                                code: 300
                            })
                        }
                    })
                }
            })
        }
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
            res.json({
                msg: "Error, compruebe su conexion e intentelo de nuevo",
                code: 400
            })
        }else if(!userExist){
            res.json({
                msg: "Correo incorrecto, intentelo de nuevo",
                code: 307
            })
        }else{
            let correoEncoding = Buffer.from(userExist.correo).toString('base64')
            let nombreEncoding = Buffer.from(userExist.nombre1).toString('base64')
            let idEncoding = Buffer.from(toString(userExist._id)).toString('base64')
            Auth.authenticateUser(userExist.estado, userExist.password, userInfo.pass, function(verified, authenticated){
                if(verified && authenticated){
                    res.json({
                        code: 300,
                        msg: "Usuario autenticado exitosamente",
                        infoClient: {
                            nombre: nombreEncoding,
                            correo: correoEncoding,
                            id: idEncoding
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
        }
    })
}

exports.deleteUser = async(req, res) =>{
	var email = req.body.mail

	if(!email){
		console.log("faltaron datos");
		res.json({
			msg: "Error, faltaron datos",
			code: 305
		})
	}else{
		Auth.deleteUser(email, function(err){
			if(err){
				console.log("Error eliminando")
				res.json({
					msg: "Error, compruebe su conexion e intentelo de nuevo",
					code: 400
				})
			}else{
				console.log("Cuenta eliminada satisfactoriamente")
				res.json({
					msg: "Su cuenta ha sido eliminada correctamente.",
					code: 311
				})
			}
		})
	}
}

exports.verifyUser = (req, res) => {
	var email = req.body.mail

	if(!email){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		Auth.findByEmail(email, function(err, userExist){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else if(!userExist){
				console.log("Correo incorreto")
				res.send("307")
			}else{
				if(userExist.estado == false){
					Auth.updateStateByEmail(email, function(err){
						if(err){
							console.log("Error consultando")
							res.send("400")
						}else{
							console.log("estado actualizado correctamente")
							res.send("310")
						}
					})
				}else{
					res.send("309")
					console.log('verificacion ya realizada')
				}
			}
		})
	}
}

exports.forgotPasswordUser = (req, res) =>{
	var email = req.body.mail
	if(!email){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		Auth.findByEmail(email, function(err, userExist){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else if(!userExist){
				console.log("Correo incorrecto")
				res.send("307")
			}else{
				var mailOptions = {
					from: 'yourclocknoreply@gmail.com',
					to: email,
					subject: 'Cambio de contraseña en Your Clock',
					text: "¡Hola "+userExist.nombre+"!, Nos enteramos que has olvidado o deseas cambiar tu contraseña, no te preocupes, puedes reestablecer una nueva ingresando al siguiente link: "+process.env.HOST_FRONT+"/#/recoverypassword/"+userExist._id+" \n\nSi usted no es el destinatario final de este correo por favor ignorarlo, muchas gracias."
				};
				Auth.sendEmailToUser(mailOptions, function(err, info){
					if(err){
						res.send("402")
					}else{
						res.send("300")
					}
				})
			}
		})
	}
}

exports.recoveryPasswordUser = (req, res) => {
	var credentials = req.body
	if(!credentials.id || !credentials.pass){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		Auth.updatePasswordById(credentials, function(err){
			if(err){
				console.log("Error consultando: "+err)
				res.send("400")
			}else{
				//console.log(common.getDateTime()+"----------------- CONTRASEÑA ACTUALIZADA -------------------")
				res.send("310")
			}
		})
	}
}