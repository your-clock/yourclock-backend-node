import mongoose from 'mongoose';
const crypto = require('crypto-js')
const Schema = mongoose.Schema;
const common = require('../config/common-functions')

const schemaUsers = new Schema({
	correo: String,
	password: String,
    nombre1: String,
    nombre2: String,
    apellido1: String,
    apellido2: String,
	ciudad: String,
	estado: Boolean,
	googleId: String,
	fecha: Date
})

schemaUsers.statics.findByEmail = function findByEmail(email, callback){
    const self = this;
    self.find({correo: email}, function(err, result){
        if(err){
            return callback(err, null)
        }else{
            if(result == ""){
                return callback(null, null)
            }else{
                return callback(null, result[0])
            }
        }
    })
}

schemaUsers.statics.updateStateByEmail = function updateStateByEmail(email, callback){
    const self = this
    self.updateOne({correo: email},{$set: {estado: true}}, function(err, resullt){
        if(err){
            return callback(err)
        }else{
            return callback(null)
        }
    })
}

schemaUsers.statics.updatePasswordById = function updatePasswordByEmail(credentials, callback){
    const self = this
    var contraHASH = crypto.HmacSHA1(credentials.pass, process.env.KEY_SHA1)
    self.updateOne({_id: credentials.id},{$set: {password: contraHASH}}, function(err, result){
        if(err){
            return callback(err)
        }else{
            return callback(null)
        }
    })
}

schemaUsers.statics.sendEmailToUser = function sendEmailToUser(mailOptions, callback){
    common.sendEmail(mailOptions, function(err, info){
        if(err){
            return callback(err)
        }else{
            return callback(null)
        }
    })
}

schemaUsers.statics.authenticateUser = function authenticateUser(state, passwordDB, passwordUser, callback){
    if(state == true){
        var passwordHASH = crypto.HmacSHA1(passwordUser, process.env.KEY_SHA1)
        if(passwordHASH == passwordDB){
            return callback(true, true)
        }else{
            return callback(false, true)
        }
    }else{
        return callback(false, false)
    }
}

schemaUsers.statics.createUser = function createUser(userInfo, callback){
    const self = this;
    var contraHASH = crypto.HmacSHA1(userInfo.pass, process.env.KEY_SHA1)
    var payload = {
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
    var myData = new self(payload)
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
        }else{
            return callback(null)
        }
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
                callback(err, result)
            }else{
                let values = {};
                values.googleId = condition.profile.id,
                values.correo = condition.profile.emails[0].value,
                values.nombre1 = condition.profile._json.given_name || 'SIN NOMBRE',
                values.apellido1 = condition.profile._json.family_name || 'SIN APELLIDO',
				values.ciudad = "NOT FOUND",
				values.fecha = new Date(),
                values.estado = true,
                values.password = crypto.HmacSHA1(process.env.PWD_OPTIONAL, process.env.KEY_SHA1)
                self.create(values, (err, result) => {
                    if(err) {
                        console.log(err);
                    }else{
                        console.log("Usuario registrado por google exitosamente");
                    }
                    return callback(err, result)
                })
            }
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

// Convertir a modelo
module.exports = mongoose.model('Usuarios', schemaUsers);