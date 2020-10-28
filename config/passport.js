const passport = require('passport');
const Usuario = require('../models/users');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const FacebookTokenStrategy = require('passport-facebook-token');

/*passport.use(new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
    }, function(accessToken, refreshToken, profile, done) {
        try{
            Usuario.findOneOrCreateByFacebook({profile}, function (err, user) {
                if(err) console.log('error: '+err);
                return done(err, user);
            });
        }catch(err2){
            console.log(err2);
            return done(err2, null);
        }
    }
));*/

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