const token = require('../../models/token')

exports.updateToken = (req, res) => {
	var token_req = req.body.token
	
	if(!token_req){
		res.status(400).json({msg: "faltaron datos"})
	}else{
		token.updateToken(token_req, function (err, newToken) {
			if (err) {
				res.json({
					msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
					code: 401
				});
			} else {
				res.json({
					msg: "Token enviado correctamente",
					code: 300,
					token: newToken
				});
			}
		})
	}
}

exports.verifyToken =  (req, res) => {
	var token_req = req.body.token
	if(!token_req){
		res.status(400).json("faltaron datos")
	}else{
		token.verifyToken(token_req, function(err) {
			if(err){
				res.send(false)
			}else{
				res.send(true)
			}
		})
	}
}

exports.createToken = (req, res) => {
	var tokenData = req.body.tokenData
	if(!tokenData){
		res.status(400).json("faltaron datos")
	}else{
		token.createToken(tokenData, function(err, newToken) {
			if (err) {
				res.status(400).json({
					msg: "Ha ocurrido un error al generar el token, intentelo de nuevo",
					code: 401
				});
			} else {
				res.json({
					msg: "Token enviado correctamente",
					code: 300,
					token: newToken
				});
			}
		})
	}
}