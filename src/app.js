const passport = require('./config/passport');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http').createServer(app)
const cookieParser = require('cookie-parser');
const session = require('express-session');
const database = require('./config/connectdb');
const mongoDBStore = require('connect-mongodb-session')(session);
const { EmailService } = require('@your-clock/yourclock-common-utils-lib');
const assert = require('assert').strict;
require('dotenv').config();

app.use(morgan('dev'));
app.use(cors({
	origin: process.env.HOST_FRONT,
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'views')));
app.use('/privacy_policy', function(req, res){
	res.sendFile('views/privacy_policy.html');
});
app.use('/google030be2b97e367ddd', function(req, res){
	res.sendFile('views/google030be2b97e367ddd.html');
});

let store;
if(process.env.NODE_ENV === 'development' || 'test'){
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

database.connect();

EmailService.set({
    environment: process.env.NODE_ENV === "production" ? "google" : "ethereal",
    etherealEmail: {
        etherealHost: process.env.ETHEREAL_HOST,
        etherealPort: process.env.ETHEREAL_PORT,
        etherealPwd: process.env.ETHEREAL_PWD,
        etherealUser: process.env.ETHEREAL_USER
    },
    googleEmail: {
        idEmail: process.env.ID_EMAIL,
        secretEmail: process.env.SECRET_EMAIL,
        tokenEmail: process.env.TOKEN_EMAIL,
        userEmail: process.env.USER_EMAIL
    }
});

app.use(session({
	cookie: { maxAge: 240 * 60 * 60 * 1000},
	store: store,
	saveUninitialized: true,
	resave: 'true',
	secret: process.env.SECRET_SESSION
}));

const userRoutes = require('./routes/Users')
const tokenRoutes = require('./routes/token')
const relojRoutes = require('./routes/reloj')

app.use('/api/user', userRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/reloj', relojRoutes);

module.exports = http
