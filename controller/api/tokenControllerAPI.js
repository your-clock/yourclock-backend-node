const token = require('../../models/token')

const error305 = {
	code: 305,
	msg: "faltaron datos"
}

/**
*@api{post}/updatetoken Peticion para actualizar token del usuario
*@apiVersion 0.0.1
*@apiName UpdateToken
*@apiGroup Token
*
*@apiParam{String} uuid Identificador unico del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
* 	"uuid": "2ee654e9-3e1a-4082-8939-f857cbc28258"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {String} uuid Identificador unico del usuario
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
* 	msg: "Token enviado correctamente",
* 	code: 300,
* 	uuid: "2ee654e9-3e1a-4082-8939-f857cbc28258"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
* 	code: 305
* 	msg: "faltaron datos"
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
* 	msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
* 	code: 401
* }
*/

exports.updateToken = async (req, res) => {
	try {
		await token.updateToken(req.body.token);
		return res.status(200).json({
			msg: "Token enviado correctamente",
			code: 300
		});
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}

/**
*@api{post}/verifytoken Peticion para verificar token del usuario
*@apiVersion 0.0.0
*@apiName VerifyToken
*@apiGroup Token
*
*@apiParam{String} uuid identificador unico del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
*		"uuid": "2ee654e9-3e1a-4082-8939-f857cbc28258"
* }
*
*@apiSuccess (Exitoso: 2XX) {Boolean} Ninguno Validacion de vigencia del token
*
*@apiSuccessExample {text} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* true
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
*		code: 305
*		msg: "faltaron datos"
* }
*/

exports.verifyToken = async (req, res) => {
	try {
		const result = await token.verifyToken(req.body.token)
		return res.status(200).send(result)
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}

/**
*@api{post}/createtoken Peticion para crear token del usuario
*@apiVersion 0.0.0
*@apiName CreateToken
*@apiGroup Token
*
*@apiParam{String} nombre Nombre encriptado del usuario
*@apiParam{String} correo Correo encriptado del usuario
*@apiParam{String} id ID del usuario en base de datos
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "nombre": "RXJuZXk=",
*    "correo": "ZWplbXBsb0B0dWRvbWluaW8uY29t",
*    "id": "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz"
*	}
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {String} uuid Identificador unico del usuario
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 201 Created
* {
* 	msg: "Token creado correctamente",
* 	code: 300,
* 	uuid: "2ee654e9-3e1a-4082-8939-f857cbc28258"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
* 	code: 305
* 	msg: "faltaron datos"
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
* 	msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
* 	code: 401
* }
*/

exports.createToken = async (req, res) => {
	try {
		const resultToken = await token.createToken(req.body.tokenData)
		return res.status(201).json({
			msg: "Token creado correctamente",
			code: 300,
			token: resultToken
		});
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}

/**
*@api{post}/deletetoken Peticion para eliminar token del usuario
*@apiVersion 0.0.0
*@apiName DeleteToken
*@apiGroup Token
*
*@apiParam{String} uuid Identificador unico del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
*    "uuid": "2ee654e9-3e1a-4082-8939-f857cbc28258"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
* 	code: 301,
* 	uuid: "Token eliminado exitosamente, ID: 1"
* }
*
*@apiError (Error cliente: 4XX) {String} msg Descripcion del error obtenido
*@apiError (Error cliente: 4XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de cliente
* HTTP/1.1 400 Bad Request
* {
* 	code: 305
* 	msg: "faltaron datos"
* }
*
*@apiError (Error servidor: 5XX) {String} msg Descripcion del error obtenido
*@apiError (Error servidor: 5XX) {Number} code Codigo del error obtenido
*
*@apiErrorExample {json} JSON de respuesta para error de servidor
* HTTP/1.1 500 Internal Server Error
* {
* 	msg: "Ha ocurrido un error al eliminar el token, intentelo de nuevo",
* 	code: 402
* }
*/

exports.deleteToken = async (req, res) => {

	try {
		await token.deleteToken(req.body.token)
		return res.status(200).json({
			code: 301,
			msg: "Token eliminado exitosamente de redis"
	    })
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}
