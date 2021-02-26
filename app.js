require('dotenv').config();
const passport = require('./config/passport');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const common = require('./config/common-functions')
const router = express.Router();
const http = require('http').createServer(app)
const socketio = require('socket.io')(http)
const axios = require('axios')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const assert = require('assert').strict;

app.use(morgan('tiny'));
app.use(cors({origin: process.env.HOST_FRONT}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'views')));
app.set('puerto', process.env.PORT || 3000);
app.use('/api', router)
app.use('/privacy_policy', function(req, res){
	res.sendFile('views/privacy_policy.html');
});
app.use('/google030be2b97e367ddd', function(req, res){
	res.sendFile('views/google030be2b97e367ddd.html');
});

let store;
if(process.env.NODE_ENV === 'development'){
  store = new session.MemoryStore;
}else{
  store = new mongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
  });
  store.on('error', function(error){
    assert.ifError(error);
    assert.ok(false);
  });
}

app.use(session({
	cookie: { maxAge: 240 * 60 * 60 * 1000},
	store: store,
	saveUninitialized: true,
	resave: 'true',
	secret: process.env.SECRET_SESSION
}));

http.listen(app.get('puerto'), function () {
  console.log(common.getDateTime()+': App listening on port: '+ app.get('puerto')+' In environment: '+process.env.NODE_ENV);
});

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
	if(err){
		console.log(common.getDateTime()+': Error conectando a Atlas: '+ err )
	}else{
		console.log(common.getDateTime()+': Conectado a Atlas')
	}
})

var datos = {
	temperatura_amb: 0,
	temperatura_local: 0
}

socketio.on("connection", socket => {
	console.log(common.getDateTime()+": conectado por socket")
})

const userRoutes = require('./routes/Users')
const tokenRoutes = require('./routes/token')

app.use('/api/user', userRoutes);
app.use('/api/token', tokenRoutes);

router.post('/datos', (req, res) => {
	let temperatura_amb = req.body.temp_amb
	let temperatura_local = req.body.temp_local
	if(!temperatura_amb || !temperatura_local){
		res.status(400).json("faltaron datos")
	}else{
		res.send("OK")
		datos.temperatura_amb = temperatura_amb
		datos.temperatura_local = temperatura_local
		console.log(datos)
		socketio.emit('datos', datos)
	}
})

router.post('/alarma', (req, res) => {
	let time = req.body.time

	if(!time){
		res.send("faltaron datos")
	}else{
		let hora = time.substr(0,2);
		let min = time.substr(3,4);
		let alarma = hora+min
		console.log(alarma);
		
		var config = {
			method: 'post',
			url: process.env.URL_THINGERIO,
			headers: {
				'Accept': 'application/json, text/plain, */*', 
				'Content-Type': 'application/json;charset=UTF-8', 
				'Authorization': process.env.TOKEN_THINGERIO
			},
			data: {
				"in" : alarma
			}
		};
		
		axios(config)
		.then(function (response) {
			console.log(JSON.stringify(response.data));
			res.send("OK")
		})
		.catch(function (error) {
			console.log(error);
			res.send(error)
		});
	}
})