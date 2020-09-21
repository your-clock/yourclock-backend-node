import mongoose from 'mongoose';
const crypto = require('crypto-js')
const Schema = mongoose.Schema;

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

schemaUsers.statics.findOneOrCreateByGoogle = function findOneOrCreate(condition, callback){
    const self = this;
    console.log('-------------- CONDITION --------------');
    console.log(condition);
    self.findOne({
        $or: [
            {'googleId': condition.profile.id}, {'email': condition.profile.emails[0].value}
        ]}, (err, result) => {
            console.log('--------------- RESULT -----------------');
            console.log(result);
            if(err) { console.log(err); }
            if(result){
                if(err) { console.log(err); }
                callback(err, result)
            }else{
                let values = {};
                values.googleId = condition.profile.id,
                values.correo = condition.profile.emails[0].value,
				values.nombre = condition.profile.displayName || 'SIN NOMBRE',
				values.ciudad = "NOT FOUND",
				values.fecha = new Date(),
                values.estado = true,
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