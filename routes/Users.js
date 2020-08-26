import express from 'express';
const crypto = require('crypto-js')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const router = express.Router();
const request = require('request')

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'yourclocknoreply@gmail.com',
	  pass: 'Erney.1997'
	}
});

// JSON's

const datos = {
	temperatura: 0
}

var mensaje = "BIenvenido, gracias por unirte a nuestra app, por favor verifique el estado de su cuenta ingresando al siguiente link: https://your-clock.herokuapp.com/#/verify Gracias por su colaboracion.";

// importar el modelo users
import Auth from '../models/users';

router.post('/login', async(req, res) => {
	
	var email = req.body.mail
	var contra = req.body.pass
	var nombre = req.body.name
	var ciudad = req.body.city
	
	if(!email || !contra || !nombre || !ciudad){	
		res.send("305")
		console.log("Error, faltaron datos")	
	}else{		
		await Auth.find({correo: email}, function(err, result){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else{
				console.log("Consulta realizada")
				if(result == ""){
					var contraHASH = crypto.HmacSHA1(contra, "ust")
					var payload = {
						correo: email,
						password: contraHASH,
						nombre: nombre,
						ciudad: ciudad,
						estado: false,
						fecha: new Date()
					}
					var myData = new Auth(payload)
					myData.save().then(item => {
						console.log('Usuario guardado en Atlas')
						res.send("300")
					})
					.catch(err => {
						console.log("No se pudo salvar el registro: "+err)
						res.send("400")
					})

					var mailOptions = {
						from: 'yourclocknoreply@gmail.com',
						to: email,
						subject: 'Verificacion cuenta en Your Clock',
						text: mensaje
					};

					transporter.sendMail(mailOptions, function(error, info){
						if (error) {
						  console.log(error);
						} else {
						  console.log('Email enviado: ' + info.response);
						}
					});

				}else{
					console.log("Usuario ya existente")
					res.send("304")	
				}
			}
		})		
	}			
})

router.post('/auth', async(req, res) => {

	var correo_req = req.body.mail
	var password_req = req.body.pass

	if(!correo_req || !password_req){
		console.log("Error, faltan datos")
		res.send("305")
	}else{
		await Auth.find({correo: correo_req}, {_id: 0,__v: 0}, function(err, result){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else{	
				if(result == ""){
					console.log("Correo incorreto")
					res.send("307")
				}else{
					var contraHASH = crypto.HmacSHA1(password_req, "ust")
					if(contraHASH == result[0].password){
						if(result[0].estado == true){
							var tokenData = {
								email: correo_req,
								contra: password_req,
							}	
							updateToken(tokenData, function(error, token){
								if(error){
									res.send("400")
								}else{
									res.send(token)
								}
							})
						}else{
							console.log('verificacion no realizada')
							res.send("308")
						}
					}else{
						res.send("306")
						console.log("Contraseña incorrecta")
					}
				}
			}
		})
	}
})

router.post('/inicio', async(req, res) => {
	var token_req = req.body.token
	
	await verifyToken(token_req, function(err, newToken){
		if(err){
			res.send("401")
			console.log("Error, el token ha expirado en inicio")
		}else{
			res.send(newToken)
			console.log('Token actualizado')
		}
	})
})

router.post('/token', async(req, res) => {
	var token_req = req.body.token
	
	await jwt.verify(token_req, 'reloj', function(err, decoded){
		if(err){
			res.send("0")
		}else{
			res.send("1")
		}
	})
})

router.post('/verify', async(req, res) => {
	var email = req.body.mail

	if(!email){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		await Auth.find({correo: email}, {_id: 0,__v: 0}, function(err, result){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else{
				if(result == ""){
					console.log("Correo incorreto")
					res.send("307")
				}else{
					if(result[0].estado == true){
						res.send("309")
						console.log('verificacion ya realizada')
					}else{
						Auth.updateOne({correo: email},{$set: {estado: true}}, function(err,resullt){
							if(err){
								console.log("Error consultando")
								res.send("400")
							}else{
								console.log("estado actualizado correctamente")
								res.send("310")
							}
						})
					}
				}
			}
		})
	}
})

router.post('/datos', async(req, res) => {
	var temperatura = req.body.temp
	if(!temperatura){
		res.send("faltaron datos")
	}else{
		res.send("OK")
		datos.temperatura = temperatura
		console.log(datos)
		module.exports.datos = datos;
	}
})

router.post('/alarma', async(req, res) =>{
	var time = req.body.time

	if(!time){
		res.send("faltaron datos")
	}else{
		var hora = time.substr(0,2);
		var min = time.substr(3,4);
		var alarma = hora+min
		const options = {
			url: 'https://cloud.arest.io/reloj1/alarma',
			form: {
				params: alarma,
				key: "821famk4b2t1q2el"
			}
		}
		request.get(options, function(err, res, body){
			let json = JSON.parse(body);
			console.log(res+" - "+body);
		})
		res.send(alarma)
	}
})

// Exportamos la configuración de express app
module.exports.router = router;
module.exports.datos = datos;




//funciones

function updateToken(tokenData, callback){
	jwt.sign(tokenData, 'reloj', {expiresIn: 60*60}, function(err,newToken){
		if(err){
			console.log("el token no fue actualizado")
			callback(true, null)
		}else{
			console.log("el token fue actualizado")
			callback(false, newToken)
		}
	})
		
}

function verifyToken(token, callback){
	jwt.verify(token, 'reloj', function(err, decoded){
		if(err){
			console.log("el token ha expirado, vuelva a ingresar")
			callback(true, null)
		}else{
			var tokenData = {
				email: decoded.email,
				contra: decoded.contra
			}	
			updateToken(tokenData,function(err, newToken){
				if(err){
					callback(true, null)
				}else{
					callback(false, newToken)
				}
			})

		}
	})
}

function getDateTime(){
	var date = new Date()
	var hour = date.getHours()
	var min = date.getMinutes()
	var sec = date.getSeconds()
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	month = (month < 10 ? "0" : "") + month
	var day = date.getDate()
	day = (day < 10 ? "0" : "") + day
	return year  + '-' + month + '-' + day + ' ' + hour + '-' + min + '-' + sec
}

