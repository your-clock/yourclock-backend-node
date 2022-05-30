const Auth = require('../../services/users');
const joi = require('joi')
const path = require('path');

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

const error305 = {
	code: 305,
	msg: "faltaron datos"
}

const error400 = {
    code: 400,
    msg: "Ha ocurrido un error en base de datos"
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

exports.userLogin = async (req, res) => {
    try {
        await Auth.validateBody(req.body, schemaLogin);
        await Auth.findByEmail(req.body.mail, false);
        var mailOptions = {
            from: 'no-reply@yourclock-app.com',
            to: req.body.mail,
            subject: 'Verificacion cuenta en Your Clock'
        }
        var plantilla = path.join(__dirname, '../../..', 'views/verification.html')
        var datos = {
            nombre: req.body.name,
            email: Buffer.from(req.body.mail).toString('base64'),
            base_url: process.env.HOST_FRONT
        }
        await Auth.sendEmailToUser(mailOptions, plantilla, datos);
        await Auth.createUser(req.body);
        return res.status(201).json({
            msg: "Usuario registrado correctamente, verifique su correo para autenticar su cuenta",
            code: 300
        })
    }catch(error){
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
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

exports.authUser = async (req, res) => {
    try {
        await Auth.validateBody(req.body, schemaAuth);
        const result = await Auth.findByEmail(req.body.mail, true);
        await Auth.authenticateUser(result.estado, result.password, req.body.pass);
        return res.status(200).json({
            code: 300,
            msg: "Usuario autenticado exitosamente",
            infoClient: {
                nombre: Buffer.from(result.nombre1).toString('base64'),
                correo: Buffer.from(result.correo).toString('base64'),
                id: Buffer.from(result._id.toString()).toString('base64')
            }
        })
    } catch (error) {
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
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

exports.deleteUser = async (req, res) => {
    try {
        await Auth.deleteUser(req.body.mail)
        return res.status(200).json({
            msg: "Su cuenta ha sido eliminada correctamente.",
            code: 311
        })
    } catch (error) {
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
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

exports.verifyUser = async (req, res) => {
    try {
        const result = await Auth.findByEmail(Buffer.from(req.body.mail, 'base64').toString('ascii'), true)
        await Auth.updateStateByEmail(result.correo, result.estado)
        return res.status(200).json({
            code: 310,
            msg: "estado actualizado correctamente"
        })
    } catch (error) {
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
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

exports.forgotPasswordUser = async (req, res) => {
    try {
        await Auth.validateBody(req.body, schemaForgot);
        const result = await Auth.findByEmail(req.body.mail, true);
        var mailOptions = {
            from: 'yourclocknoreply@gmail.com',
            to: req.body.mail,
            subject: 'Cambio de contraseña en Your Clock'
        };
        var plantilla = path.join(__dirname, '../../..', 'views/forgotPassword.html')
        var datos = {
            nombre: result.nombre1,
            id: Buffer.from(result._id.toString()).toString('base64'),
            base_url: process.env.HOST_FRONT
        }
        await Auth.sendEmailToUser(mailOptions, plantilla, datos);
        return res.status(200).json({
            code: 300,
            msg: "Mensaje enviado exitosamente, verifique su correo para cambiar su contraseña"
        })
    } catch (error) {
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
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

exports.recoveryPasswordUser = async (req, res) => {
    try {
        await Auth.updatePasswordById(req.body)
        return res.status(200).json({
            code: 310,
            msg: "Contraseña reestablecida correctamente"
        })
    } catch (error) {
        return res.status(error.statusCode || 500).send(error.body || error.toString())
    }
}

//*********************************** AUTENTICACION DE GOOGLE ************************************************

exports.getUrlGoogle = function(req, res) {
	return res.status(200).send(Auth.getGoogleUrl());
};

exports.callbackGoogle = function(req, res) {
    const correoEncoding = Buffer.from(req.user.correo).toString('base64')
    const nombreEncoding = Buffer.from(req.user.nombre1).toString('base64')
    const idEncoding = Buffer.from(req.user._id.toString()).toString('base64')
    return res.send(`<script>window.location.href="${process.env.HOST_FRONT}/#/usergoogle/${idEncoding}/${correoEncoding}/${nombreEncoding}";</script>`);
}
