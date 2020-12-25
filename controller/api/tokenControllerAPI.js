const token = require('../../models/token')

/**
*@api{post}/updatetoken Peticion para actualizar token del usuario
*@apiVersion 0.0.0
*@apiName UpdateToken
*@apiGroup Token
*
*@apiParam{String} token Token a actualizar del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
* 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImUuZGF2aWRndkBob3RtYWlsLmNvbSIsImNvbnRyYSI6ImVjYzQ3NTBjNTgxZWY1NDZjYWE3NTI4YmJiYzc4N2QwODllNWVhYjciLCJpYXQiOjE2MDI1MzkwMTksImV4cCI6MTYwMjU0MjYxOX0.VXJ2_UwyQu1LrybFYAj8iFNMvYLSMlb5Ukc-9WQ_2jU"
* }
*
*@apiSuccess (Exitoso: 2XX) {String} msg Descripcion del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {Number} code Codigo del resultado obtenido
*@apiSuccess (Exitoso: 2XX) {String} token Token actualizado
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
* 	msg: "Token enviado correctamente",
* 	code: 300,
* 	token: "1g8hwGciOiJIUzIsh9IsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6I8UuZGF2aWRndkBob3RtYWlsLmNvbSIsImNvb2jyYSI6ImVjYzQ3NTBjNTgxZWY1NDZjYWw3NTI4YmJiYzc4N2QwODllNWVhYjciLCJpYXQiOjE2MDI1MzkwMTksImV4cCI6MTYwMjU0MjgxOX0.VXJ2_UwyQu1LrybFYAj8iFNMvYLSMlb5Ukc-9WQ_3rj"
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

exports.updateToken = (req, res) => {

	let token_req = req.body.token

	if(!token_req){
		return res.status(400).json({
			 code: 305,
			 msg: "faltaron datos"
		})
	}
	token.updateToken(token_req, function (err, newToken) {
		if (err) {
			return res.json({
				msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
				code: 401
			});
		}
		return res.json({
			msg: "Token enviado correctamente",
			code: 300,
			token: newToken
		});
	})
}

/**
*@api{post}/verifytoken Peticion para verificar token del usuario
*@apiVersion 0.0.0
*@apiName VerifyToken
*@apiGroup Token
*
*@apiParam{String} token Token a verificar del usuario
*
*@apiParamExample {json} JSON de ejemplo
* {
*		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImUuZGF2aWRndkBob3RtYWlsLmNvbSIsImNvbnRyYSI6ImVjYzQ3NTBjNTgxZWY1NDZjYWE3NTI4YmJiYzc4N2QwODllNWVhYjciLCJpYXQiOjE2MDI1MzkwMTksImV4cCI6MTYwMjU0MjYxOX0.VXJ2_UwyQu1LrybFYAj8iFNMvYLSMlb5Ukc-9WQ_2jU"
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

exports.verifyToken =  (req, res) => {

	let token_req = req.body.token

	if(!token_req){
		return res.status(400).json({
			 code: 305,
			 msg: "faltaron datos"
		})
	}
	token.verifyToken(token_req, function(err) {
		if(err){
			return res.send(false)
		}
		return res.send(true)
	})
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
*@apiSuccess (Exitoso: 2XX) {String} token Token actualizado
*
*@apiSuccessExample {json} JSON de respuesta exitosa
* HTTP/1.1 200 OK
* {
* 	msg: "Token enviado correctamente",
* 	code: 300,
* 	token: "1g8hwGciOiJIUzIsh9IsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6I8UuZGF2aWRndkBob3RtYWlsLmNvbSIsImNvb2jyYSI6ImVjYzQ3NTBjNTgxZWY1NDZjYWw3NTI4YmJiYzc4N2QwODllNWVhYjciLCJpYXQiOjE2MDI1MzkwMTksImV4cCI6MTYwMjU0MjgxOX0.VXJ2_UwyQu1LrybFYAj8iFNMvYLSMlb5Ukc-9WQ_3rj"
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

exports.createToken = (req, res) => {

	let tokenData = req.body.tokenData

	if(!tokenData){
		return res.status(400).json({
			 code: 305,
			 msg: "faltaron datos"
		})
	}
	token.createToken(tokenData, function(err, newToken) {
		if (err) {
			return res.status(400).json({
				msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
				code: 401
			});
		}
		return res.json({
			msg: "Token enviado correctamente",
			code: 300,
			token: newToken
		});
	})
}
