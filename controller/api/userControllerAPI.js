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

const schemaForgot = joi.object({
    mail: joi.string().min(6).required().email()
})

const error403 = {
	msg: "Ha ocurrido un error interno en el servidor",
	code: 403
}
const error400 = {
    code: 400,
    msg: "Ha ocurrido un error en base de datos"
}
const error305 = {
	code: 305,
	msg: "faltaron datos"
}

/**
*@api{post}/login Peticion para registrar un usuario
*@apiVersion 0.0.0
*@apiName LoginUser
*@apiGroup Usuario
*
*@apiParam{String} mail Correo del usuario a registrar
*@apiParam{String{min. 8}} pass Contraseña del usuario a registrar
*@apiParam{String} name1 Primer nombre del usuario a registrar
*@apiParam{String} [name2] Segundo nombre del usuario a registrar
*@apiParam{String} lastName1 Primer apellido del usuario a registrar
*@apiParam{String} [lastName2] Segundo apellido del usuario a registrar
*@apiParam{String} city Ciudad del usuario a registrar
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "mail": "ejemplo@tudominio.com",
*    "pass": "H0l4Mund0",
*    "name1": "Erney",
*    "name2": "David",
*    "lastName1": "Garcia",
*    "lastName2": "Vergara",
*    "city": "Bogota"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 201 Created
* {
*    msg: "Usuario registrado correctamente, verifique su correo para autenticar su cuenta",
*    code: 300
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*@apiError (Error cliente: 4XX) {String} errorDetail Mensaje del error obtenido
*@apiError (Error cliente: 4XX) {String} errorKey Nombre del elemento obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Por favor revise su mail",
*    code: 305,
*    errorKey: mail,
*    errorDetail: "\"mail\" must be a valid email"
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 502 Bad Gateway
* {
*    msg: "Ha ocurrido un error en base de datos",
*    code: 400
* }
*/

exports.userLogin = (req, res) => {
	const userInfo = req.body
    const {error} = schemaLogin.validate(userInfo);
    if (error) {
        return res.status(400).json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 306,
            msg: `Por favor revise su ${error.details[0].context.key}`
        })
    }
    Auth.findByEmail(userInfo.mail, function(errorFind, userExist){
        if(errorFind){
            return res.status(500).json(error400)
        }else if(userExist){
            return res.status(200).json({
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
        Auth.sendEmailToUser(mailOptions, plantilla, datos, function(errorSend){
            if(errorSend){
                return res.status(500).json({
                    msg: "Error al enviar el correo, verifique su conexion, si el error persiste, intente mas tarde",
                    code: 402,
                    info: error
                })
            }
            Auth.createUser(userInfo, function(errorCreate){
                if(errorCreate){
                    return res.status(500).json(error400)
                }
                return res.status(201).json({
                    msg: "Usuario registrado correctamente, verifique su correo para autenticar su cuenta",
                    code: 300
                })
            })
            return res.status(500).json(error403)
        })
        return res.status(500).json(error403)
    })
    return res.status(500).json(error403)
}

/**
*@api{post}/auth Peticion para autenticar a un usuario
*@apiVersion 0.0.0
*@apiName AuthUser
*@apiGroup Usuario
*
*@apiParam{String} mail Correo del usuario a autenticar
*@apiParam{String{min. 8}} pass Contraseña del usuario a autenticar
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "mail": "ejemplo@tudominio.com",
*    "pass": "H0l4Mund0"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Object} infoClient Informacion basica del usuario autenticado
*@apiSuccess (Exitoso: 2XX) {String} infoClient.nombre Nombre encriptado del usuario autenticado
*@apiSuccess (Exitoso: 2XX) {String} infoClient.correo Correo encriptado del usuario autenticado
*@apiSuccess (Exitoso: 2XX) {String} infoClient.id ID encriptado del usuario autenticado
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
*    code: 300,
*    msg: "Usuario autenticado exitosamente",
*    infoClient: {
*        nombre: "RXJuZXk=",
*        correo: "ZWplbXBsb0B0dWRvbWluaW8uY29t",
*        id: "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz"
*    }
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*@apiError (Error cliente: 4XX) {String} errorDetail Mensaje del error obtenido
*@apiError (Error cliente: 4XX) {String} errorKey Nombre del elemento obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Por favor revise su mail",
*    code: 305,
*    errorKey: mail,
*    errorDetail: "\"mail\" must be a valid email"
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 502 Bad Gateway
* {
*    msg: "Ha ocurrido un error en base de datos",
*    code: 400
* }
*/

exports.authUser = (req, res) => {
	const userInfo = req.body
	const {error} = schemaAuth.validate(userInfo);
    if (error) {
        return res.status(400).json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 306,
            msg: `Por favor revise su ${error.details[0].context.key}`
        })
    }
    Auth.findByEmail(userInfo.mail, function(err, userExist){
        if(err){
            return res.json(error400)
        }else if(!userExist){
            return res.json({
                msg: "Correo incorrecto, intentelo de nuevo",
                code: 307
            })
        }
        Auth.authenticateUser(userExist.estado, userExist.password, userInfo.pass, function(verified, authenticated){
            if(verified && authenticated){
                return res.json({
                    code: 300,
                    msg: "Usuario autenticado exitosamente",
                    infoClient: {
                        nombre: Buffer.from(userExist.nombre1).toString('base64'),
                        correo: Buffer.from(userExist.correo).toString('base64'),
                        id: Buffer.from(userExist._id.toString()).toString('base64')
                    }
                })
            }else if(!verified && authenticated){
                return res.json({
                    msg: "contraseña incorrecta, intentelo de nuevo",
                    code: 306
                })
            }else if(!verified && !authenticated){
                return res.json({
                    msg: "Por favor verifique su cuenta para continuar",
                    code: 308
                })
            }
            return res.status(500).json(error403)
        })
        return res.status(500).json(error403)
    })
    return res.status(500).json(error403)
}

/**
*@api{post}/deleteaccount Peticion para eliminar a un usuario
*@apiVersion 0.0.0
*@apiName DeleteUser
*@apiGroup Usuario
*
*@apiParam{String} mail Correo encriptado del usuario a eliminar
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "mail": "ZWplbXBsb0B0dWRvbWluaW8uY29t"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
*    msg: "Su cuenta ha sido eliminada correctamente.",
*    code: 311
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Error, faltaron datos",
*    code: 305
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
*    msg: "Ha ocurrido un error en base de datos",
*    code: 400
* }
*/

exports.deleteUser = (req, res) => {
    let email = req.body.mail
    if(!email){
    	console.log("faltaron datos");
    	return res.json(error305)
    }
    email = Buffer.from(email, 'base64').toString('ascii')
    Auth.deleteUser(email, function(err){
        if(err){
            console.log("Error eliminando")
            return res.json(error400)
        }
        console.log("Cuenta eliminada satisfactoriamente")
        return res.json({
            msg: "Su cuenta ha sido eliminada correctamente.",
            code: 311
        })
    })
    return res.status(500).json(error403)
}

/**
*@api{post}/verify Peticion para verificar la cuenta de un usuario
*@apiVersion 0.0.0
*@apiName VerifyUser
*@apiGroup Usuario
*
*@apiParam{String} mail Correo encriptado del usuario a verificar
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "mail": "ZWplbXBsb0B0dWRvbWluaW8uY29t"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
*    code: 310,
*    msg: "estado actualizado correctamente"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Error, faltaron datos",
*    code: 305
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
*    msg: "Ha ocurrido un error en base de datos",
*    code: 400
* }
*/

exports.verifyUser = (req, res) => {
	const email = req.body.mail
    if(!email){
        return res.json(error305)
    }
    Auth.findByEmail(Buffer.from(email, 'base64').toString('ascii'), function(err, userExist){
        if(err){
            return res.send(error400)
        }else if(!userExist){
            return res.send({
                code: 307,
                msg: "Correo incorrecto"
            })
        }
        if(!userExist.estado){
            Auth.updateStateByEmail(userExist.correo, function(errorUpdate){
                if(errorUpdate){
                    return res.send(error400)
                }
                return res.json({
                    code: 310,
                    msg: "estado actualizado correctamente"
                })
            })
            return res.status(500).json(error403)
        }else{
            return res.json({
                code: 309,
                msg: "verificacion ya realizada"
            })
        }
    })
    return res.status(500).json(error403)
}

/**
*@api{post}/forgotpassword Peticion para solicitar cambio de contraseña
*@apiVersion 0.0.0
*@apiName ForgotPasswordUser
*@apiGroup Usuario
*
*@apiParam{String} mail Correo del usuario a cambiar de contraseña
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "mail": "ejemplo@tudominio.com"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
*    code: 300,
*    msg: "Mensaje enviado exitosamente, verifique su correo para cambiar su contraseña"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Error, faltaron datos",
*    code: 305
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
*    msg: "Ha ocurrido un error en base de datos",
*    code: 400
* }
*/

exports.forgotPasswordUser = (req, res) => {
    var userInfo = req.body
  	if(!userInfo.mail){
        return res.status(400).json(error305)
    }
    const {error} = schemaForgot.validate(userInfo);
    if (error) {
        return res.status(400).json({
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 306,
            msg: `Por favor revise su ${error.details[0].context.key}`
        })
    }
    Auth.findByEmail(userInfo.mail, function(err, userExist){
        if(err){
            console.log("Error consultando; "+err)
            return res.status(500).json(error400)
        }else if(!userExist){
            return res.status(400).json({
                code: 307,
                msg: "Correo incorrecto o inexistente, compruebe la informacion"
            })
        }
        const mailOptions = {
            from: 'yourclocknoreply@gmail.com',
            to: userInfo.mail,
            subject: 'Cambio de contraseña en Your Clock'
        };
        var plantilla = path.join(__dirname, '../..', 'views/forgotPassword.html')
        var datos = {
            nombre: userExist.nombre1,
            id: Buffer.from(userExist._id.toString()).toString('base64'),
            base_url: process.env.HOST_FRONT
        }
        Auth.sendEmailToUser(mailOptions, plantilla, datos, function(errorSend, info){
            if(errorSend){
                return res.status(500).json({
                    code: 402,
                    msg: "Error al enviar el correo, intentelo de nuevo"
                })
            }
            return res.status(200).json({
                code: 300,
                msg: "Mensaje enviado exitosamente, verifique su correo para cambiar su contraseña"
            })
        })
        return res.status(500).json(error403)
    })
    return res.status(500).json(error403)
}

/**
*@api{post}/recoverypassword Peticion para realizar cambio de contraseña
*@apiVersion 0.0.0
*@apiName RecoveryPasswordUser
*@apiGroup Usuario
*
*@apiParam{String} id ID encriptado del usuario
*@apiParam{String} pass Contraseña nueva del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "id": "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz",
*    "pass": "Nu3v4_c0ntr4"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
*    code: 310,
*    msg: "Contraseña reestablecida correctamente"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*    msg: "Error, faltaron datos",
*    code: 305
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
*    msg: "Ha ocurrido un error en base de datos,
*    code: 400
* }
*/

exports.recoveryPasswordUser = (req, res) => {
  	const credentials = req.body
  	if(!credentials.id || !credentials.pass){
        return res.json(error305)
  	}
    Auth.updatePasswordById(credentials, function(err){
        if(err){
            return res.json(error400)
        }
        //console.log(common.getDateTime()+"----------------- CONTRASEÑA ACTUALIZADA -------------------")
        return res.json({
            code: 310,
            msg: "Contraseña reestablecida correctamente"
        })
    })
    return res.status(500).json(error403)
}

//*********************************** AUTENTICACION DE GOOGLE ************************************************

exports.getUrlGoogle = function(req, res){
	return res.send(Auth.getGoogleUrl());
};

exports.callbackGoogle = function(req, res) {
    const correoEncoding = Buffer.from(req.user.correo).toString('base64')
    const nombreEncoding = Buffer.from(req.user.nombre1).toString('base64')
    const idEncoding = Buffer.from(req.user._id.toString()).toString('base64')
    return res.send(`<script>window.location.href="${process.env.HOST_FRONT}/#/usergoogle/${idEncoding}/${correoEncoding}/${nombreEncoding}";</script>`);
}
