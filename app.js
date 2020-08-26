//----------LIBRERIAS-------------------------------------
require('dotenv').config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const passport = require('./config/passport');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const history = require('connect-history-api-fallback');        // Middleware para Vue.js router modo history
const app = express();
const crypto = require('crypto-js')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const router = express.Router();
var http = require('http').createServer(app)
const socketio = require('socket.io')(http)
const axios = require('axios')
//--------------------------------------------------------

//----------CONFIGURACION---------------------------------
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))     //application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(history());
app.use('/api', router)
app.set('puerto', process.env.PORT || 3000);
app.use('/privacy_policy', function(req, res){
	res.sendFile('public/privacy_policy.html');
});
app.use('google030be2b97e367ddd', function(req, res){
	res.sendFile('public/google030be2b97e367ddd.html');
});
//-------------------------------------------------------

//--------------------SERVIDOR---------------------------
http.listen(app.get('puerto'), function () {
  console.log(getDateTime()+': App listening on port: '+ app.get('puerto')+' In environment: '+process.env.NODE_ENV);
});
//-------------------------------------------------------

//----------------DATABASE-------------------------------
const connectionstring = process.env.MONGO_URI

mongoose.connect(connectionstring, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, res){
	if(err){
		console.log(getDateTime()+': Error conectando a Atlas: '+ err )
	}else{
		console.log(getDateTime()+': Conectado a Atlas')
	}
})
//--------------------------------------------------------

//-------------------JSON's-------------------------------
const datos = {
	temperatura_amb: 0,
	temperatura_local: 0
}
//--------------------------------------------------------

//-------------------SOCKET-------------------------------
socketio.on("connection", socket => {
	console.log(getDateTime()+": conectado por socket")
})
//--------------------------------------------------------

//---------------CONFIG. MENSAJE CORREO-------------------
var mailConfig;
if(process.env.NODE_ENV === "production"){
	const myOAuth2Client = new OAuth2(
		process.env.ID_EMAIL,
		process.env.SECRET_EMAIL,
	)
	myOAuth2Client.setCredentials({
		refresh_token: process.env.TOKEN_EMAIL
	});
	const myAccessToken = myOAuth2Client.getAccessToken()
	mailConfig = {
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: process.env.USER_EMAIL, //your gmail account you used to set the project up in google cloud console"
			clientId: process.env.ID_EMAIL,
			clientSecret: process.env.SECRET_EMAIL,
			refreshToken: process.env.TOKEN_EMAIL,
			accessToken: myAccessToken //access token variable we defined earlier
		}
	};
}else if(process.env.NODE_ENV === "development"){
	mailConfig = {
		host: 'smtp.ethereal.email',
		port: 587,
		auth: {
			user: process.env.ethereal_user,
			pass: process.env.ethereal_pwd
		}
	};
}

const transporter = nodemailer.createTransport(mailConfig);

// verify connection configuration
transporter.verify(function(error, success) {
	if (error) {
	  	console.log(error);
	} else {
	  	console.log(getDateTime()+": Server is ready to take our messages");
	}
});
//---------------------------------------------------------

//------------------GOOGLE VERIFICATION--------------------

app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', passport.authenticate( 'google', {
    successRedirect: '/inicio',
    failureRedirect: '/error'
  })
);

//---------------------------------------------------------

//--------------------IMPORTS------------------------------
const Auth = require('./models/users');
//---------------------------------------------------------

//------------------ROUTER---------------------------------
router.post('/login', async(req, res) => {
	
	var email = req.body.mail
	var contra = req.body.pass
	var nombre = req.body.name
	var ciudad = req.body.city
	
	if(!email || !contra || !nombre || !ciudad){	
		res.send("305")
		console.log(getDateTime()+": Error, faltaron datos")	
	}else{		
		await Auth.find({correo: email}, function(err, result){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else{
				console.log("Consulta realizada")
				if(result == ""){
					var mailOptions = {
						from: 'no-reply@yourclock-app.com',
						to: email,
						subject: 'Verificacion cuenta en Your Clock',
						html: {
								path: __dirname+`/views/verification-${process.env.NODE_ENV}.html`
						}
					};
					sendEmail(mailOptions, function(err, info){
						if(err){
							res.send("402")
						}else{
							var contraHASH = crypto.HmacSHA1(contra, process.env.KEY_SHA1)
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
					var contraHASH = crypto.HmacSHA1(password_req, process.env.KEY_SHA1)
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
	
	if(!token_req){
		res.status(400).json("faltaron datos")
	}else{
		await verifyToken(token_req, function(err, newToken){
			if(err){
				res.send("401")
			}else{
				res.send(newToken)
			}
		})
	}
})

router.post('/token', async(req, res) => {
	var token_req = req.body.token
	
	if(!token_req){
		res.status(400).json("faltaron datos")
	}else{
		await jwt.verify(token_req, process.env.KEY_TOKEN, function(err, decoded){
			if(err){
				res.send("0")
				console.log("token no valido: "+err)
			}else{
				res.send("1")
				console.log("el token es valido")
			}
		})
	}
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
	var temperatura_amb = req.body.temp_amb
	var temperatura_local = req.body.temp_local
	if(!temperatura_amb || !temperatura_local){
		res.status(400).json("faltaron datos")
	}else{
		res.send("OK")
		datos.temperatura_amb = temperatura_amb
		datos.temperatura_local = temperatura_local
		await socketio.emit('datos',datos)
		console.log(datos)
	}
})

router.post('/alarma', async(req, res) =>{
	var time = req.body.time

	if(!time){
		res.status(400).json("faltaron datos")
	}else{
		var hora = time.substr(0,2);
		var min = time.substr(3,4);
		var alarma = hora+min
		await axios.get('https://cloud.arest.io/reloj1/alarma',{
			params: {
				params: alarma,
				key: process.env.KEY_ARESTIO
			}
		})
		.then(response => {
			console.log(response.data)
			res.send(response.data)
		})
		.catch(error => {
			console.log("error: "+error)
			res.send(error.message)
		})
	}
})

router.post('/forgotpassword', async(req, res) =>{
	var email = req.body.mail
	if(!email){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		await Auth.find({correo: email}, function(err, result){
			if(err){
				console.log("Error consultando")
				res.send("400")
			}else{
				if(result == ""){
					console.log("Correo incorrecto")
					res.send("307")
				}else{
					var mailOptions = {
						from: 'yourclocknoreply@gmail.com',
						to: email,
						subject: 'Cambio de contraseña en Your Clock',
						text: "¡Hola "+result[0].nombre+"!, Nos enteramos que has olvidado o deseas cambiar tu contraseña, no te preocupes, puedes reestablecer una nueva ingresando al siguiente link: "+process.env.HOST+"/#/recoverypassword/"+result[0]._id+" \nSi usted no es el destinatario de este correo por favor ignorarlo, muchas gracias."
					};
					sendEmail(mailOptions, function(err, info){
						if(err){
							res.send("402")
						}else{
							res.send("300")
						}
					});
				}
			}
		})
	}
})

router.post('/recoverypassword', async(req, res) =>{
	var id = req.body.id
	var password = req.body.pass
	if(!id || !password){
		console.log('error, faltaron datos')
		res.send("305")
	}else{
		var contraHASH = crypto.HmacSHA1(password, process.env.KEY_SHA1)
		await Auth.updateOne({_id: id},{$set: {password: contraHASH}}, function(err, result){
			if(err){
				console.log("Error consultando: "+err)
				res.send("400")
			}else{
				console.log(getDateTime()+"----------------- CONTRASEÑA ACTUALIZADA -------------------")
				res.send("310")
			}
		})
	}
})





//-----------------------------------------------------------

//-------------------FUNCIONES-------------------------------
function updateToken(tokenData, callback){
	jwt.sign(tokenData, process.env.KEY_TOKEN, {expiresIn: 60*60}, function(err,newToken){
		if(err){
			console.log(getDateTime()+":------------------ TOKEN NO ACTUALIZADO ---------------------\n")
			console.log(err)
			callback(true, null)
		}else{
			console.log(getDateTime()+":-------------------- TOKEN ACTUALIZADO ----------------------\n")
			callback(false, newToken)
		}
	})
		
}

function verifyToken(token, callback){
	jwt.verify(token, process.env.KEY_TOKEN, function(err, decoded){
		if(err){
			console.log(getDateTime()+":--------------------- TOKEN EXPIRADO -----------------------\n")
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

function sendEmail(mailOptions, callback){
	if(!mailOptions){
		console.log(getDateTime()+":--------------- NO LLEGO OPCIONES DE MAIL --------------------\n")
		callback(true, "No se recibio el parametro mailOptions")
	}else{
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log(getDateTime()+":-------------- ERROR AL ENVIAR EL MENSAJE ------------------\n")
				console.log(error)
				callback(true, error)
				transporter.close();
			}else{
				console.log(getDateTime()+":-------------------- MENSAJE ENVIADO -----------------------\n")
				console.log(info.response)
				callback(false, info.response);
				transporter.close();
			}
		})
	}
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
//---------------------------------------------------------