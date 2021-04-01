import mongoose from 'mongoose';
import { google } from 'googleapis';
const crypto = require('crypto-js')
const Schema = mongoose.Schema;
const common = require('../config/common-functions')

const schemaUsers = new Schema({
	correo: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
	password: {
        type: String,
        required: true,
        max: 1024,
        min: 8
    },
    nombre1: {
        type: String,
        required: true,
        max: 255,
        min: 1
    },
    nombre2: {
        type: String,
        required: false,
        max: 255,
        min: 1
    },
    apellido1: {
        type: String,
        required: true,
        max: 255,
        min: 1
    },
    apellido2: {
        type: String,
        required: false,
        max: 255,
        min: 1
    },
	ciudad: {
        type: String,
        required: true,
        max: 255,
        min: 1
    },
	estado: Boolean,
	googleId: {
        type: String,
        required: false,
        max: 1024,
        min: 6
    },
	fecha: {
        type: Date,
        default: Date.now
    }
})

schemaUsers.statics.findByEmail = function findByEmail(email, callback){
    const self = this;
    self.find({correo: email}, function(err, result){
        if(err){
            return callback(err, null)
        }
        if(result == ""){
            return callback(null, null)
        }
        return callback(null, result[0])
    })
}

schemaUsers.statics.updateStateByEmail = function updateStateByEmail(email, callback){
    const self = this
    console.log(email);
    self.updateOne({correo: email},{$set: {estado: true}}, function(err, result){
        if(err){
            return callback(err)
        }
        console.log(result);
        return callback(null)
    })
}

schemaUsers.statics.updatePasswordById = function updatePasswordByEmail(credentials, callback){
    const self = this
    let contraHASH = crypto.HmacSHA1(credentials.pass, process.env.KEY_SHA1)
    let idDecode = Buffer.from(credentials.id, 'base64').toString('ascii');
    self.updateOne({_id: idDecode},{$set: {password: contraHASH}}, function(err, result){
        if(err){
            return callback(err)
        }
        return callback(null)
    })
}

schemaUsers.statics.sendEmailToUser = function sendEmailToUser(mailOptions, plantilla, datos, callback){
    common.renderHtml(plantilla, datos, function(err, result) {
        if(err){ console.log(err); return callback(err) }
        mailOptions.html = result;
        common.sendEmail(mailOptions, function(errorSend, info){
            if(errorSend){ return callback(errorSend) }
            return callback(null)
        })
    })
}

schemaUsers.statics.authenticateUser = function authenticateUser(state, passwordDB, passwordUser, callback){
    if(state == true){
        let passwordHASH = crypto.HmacSHA1(passwordUser, process.env.KEY_SHA1)
        if(passwordHASH == passwordDB){
            return callback(true, true)
        }
        return callback(false, true)
    }
    return callback(false, false)
}

schemaUsers.statics.createUser = function createUser(userInfo, callback){
    const self = this;
    let contraHASH = crypto.HmacSHA1(userInfo.pass, process.env.KEY_SHA1)
    let payload = {
        correo: userInfo.mail,
        password: contraHASH,
        nombre1: userInfo.name1,
        nombre2: userInfo.name2,
        apellido1: userInfo.lastName1,
        apellido2: userInfo.lastName2,
        ciudad: userInfo.city,
        estado: false,
        fecha: new Date()
    }
    let myData = new self(payload)
    myData.save().then(item => {
        return callback(null)
    })
    .catch(err => {
        return callback(err)
    })
}

schemaUsers.statics.deleteUser = function deleteUser(email, callback){
    const self = this
    self.deleteOne({correo: email}, function(err, result){
        if(err){
            console.log(err);
            return callback(err)
        }
        return callback(null)
    })
}

schemaUsers.statics.getGoogleUrl = function getGoogleUrl(){
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.HOST + '/api/user/auth/google/callback'
    );
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'profile',
            'email'
        ]
    })
}

schemaUsers.statics.findOneOrCreateByGoogle = function findOneOrCreate(condition, callback){
    const self = this;
    self.findOne({
        $or: [
            {'googleId': condition.profile.id}, {'email': condition.profile.emails[0].value}
        ]}, (err, result) => {
            if(err) { console.log(err); }
            if(result){
                if(err) { console.log(err); }
                return callback(err, result)
            }
            let values = {};
            values.googleId = condition.profile.id;
            values.correo = condition.profile.emails[0].value;
            values.nombre1 = condition.profile._json.given_name || 'SIN NOMBRE';
            values.apellido1 = condition.profile._json.family_name || 'SIN APELLIDO';
            values.ciudad = "NOT FOUND";
            values.fecha = new Date();
            values.estado = true;
            values.password = crypto.HmacSHA1(process.env.PWD_OPTIONAL, process.env.KEY_SHA1);
            self.create(values, (errorCreate, resultCreate) => {
                if(errorCreate) {
                    console.log(errorCreate);
                }else{
                    console.log("Usuario registrado por google exitosamente");
                }
                return callback(errorCreate, resultCreate)
            })
        }
    )
}

/*schemaUsers.statics.findOneOrCreateByFacebook = function findOneOrCreate(condition, callback){
    const self = this;
    console.log('-------------- CONDITION --------------');
    console.log(condition);
    self.findOne({
        $or: [
            {'facebookId': condition.profile.id}, {'email': condition.profile.emails[0].value}
        ]}, (err, result) => {
            console.log('--------------- RESULT -----------------');
            console.log(result);
            if(err) { console.log(err); }
            if(result){
                if(err) { console.log(err); }
                callback(err, result)
            }else{
                let values = {};
                values.facebookId = condition.profile.id,
                values.email = condition.profile.emails[0].value,
                values.nombre = condition.profile.displayName || 'SIN NOMBRE',
                values.verificado = true,
                values.password = crypto.randomBytes(16).toString('hex');
                console.log('-------------- VALUES -----------------');
                console.log(values);
                self.create(values, (err, result) => {
                    if(err) { console.log(err); }
                    return callback(err, result)
                })
            }
        }
    )
}*/

module.exports = mongoose.model('Usuarios', schemaUsers);
