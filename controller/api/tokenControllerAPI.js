const token = require('../../models/token')

exports.updateToken = (req, res) => {

	let token_req = req.body.token
	
	if(!token_req){
		return res.status(400).json({msg: "faltaron datos"})
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

exports.verifyToken =  (req, res) => {
	
	let token_req = req.body.token

	if(!token_req){
		return res.status(400).json("faltaron datos")
	}
	token.verifyToken(token_req, function(err) {
		if(err){
			return res.send(false)
		}
		return res.send(true)
	})
}

exports.createToken = (req, res) => {

	let tokenData = req.body.tokenData

	if(!tokenData){
		return res.status(400).json("faltaron datos")
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