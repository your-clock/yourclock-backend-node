const passport = require('passport');
const Usuario = require('../models/users');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.HOST + '/api/user/auth/google/callback'
    },
    function(request, accessToken, refreshToken, profile, cb) {
        Usuario.findOneOrCreateByGoogle({profile}, function (err, user) {
            return cb(err, user);
        });
    }
));

passport.serializeUser(function(user, cb){
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
    Usuario.findById(id, function(err, usuario){
        cb(err, usuario);
    });
});

module.exports = passport;
