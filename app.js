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
app.use(cors());
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

/*app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE');
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// Pass to next layer of middleware
	next();
  });*/

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

router.post('/api/datos', (req, res) => {
	let temperatura_amb = req.body.temp_amb
	let temperatura_local = req.body.temp_local
	if(!temperatura_amb || !temperatura_local){
		res.status(400).json("faltaron datos")
	}else{
		res.send("OK")
		datos.temperatura_amb = temperatura_amb
		datos.temperatura_local = temperatura_local
		socketio.emit('datos', datos)
		console.log(datos)
	}
})

router.post('/api/alarma', (req, res) => {
	let time = req.body.time

	if(!time){
		res.status(400).json("faltaron datos")
	}else{
		let hora = time.substr(0,2);
		let min = time.substr(3,4);
		let alarma = hora+min
		axios.get('https://cloud.arest.io/reloj1/alarma',{
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