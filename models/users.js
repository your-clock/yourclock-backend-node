const mongoose = require('mongoose');
const { google } = require('googleapis');
const crypto = require('crypto-js');
const EmailTemplates = require('swig-email-templates');
const transporter = require('../config/email')
const Schema = mongoose.Schema;

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

const error400 = {
    code: 400,
    msg: "Ha ocurrido un error en base de datos"
}

schemaUsers.statics.validateBody = function validateBody(body, schema) {
    const {error} = schema.validate(body);
    if(error){
        const err = new Error('Error al validar el body')
        err.body = {
            errorDetail: error.details[0].message,
            errorKey: error.details[0].context.key,
            code: 306,
            msg: `Por favor revise su ${error.details[0].context.key}`
        }
        err.statusCode = 400
        throw err;
    }
}

schemaUsers.statics.findByEmail = async function(email, needUserExist){
    const result = await this.find({correo: email})
    if(needUserExist && !result[0]){
        const err = new Error('Correo no existente')
        err.body = {
            msg: "Correo no existente, verifique la informacion",
            code: 304
        }
        err.statusCode = 400
        throw err
    }else if(!needUserExist && result[0]){
        const err = new Error('El correo ya existe')
        err.body = {
            msg: "Usuario ya existente, verifique la informacion",
            code: 304
        }
        err.statusCode = 400
        throw err;
    }
    return result[0]
}

schemaUsers.statics.updateStateByEmail = async function(email, state) {
    if(state){
        const err = new Error('Verificacion ya realizada')
        err.body = {
            code: 309,
            msg: "verificacion ya realizada"
        }
        err.statusCode = 400
        throw err;
    }else{
        const result = await this.updateOne({correo: email},{$set: {estado: true}})
        if(result.nModified === 0){
            const err = new Error('Actualizacion no realizada')
            err.body = {
                code: 309,
                msg: "Actualizacion no realizada en base de datos"
            }
            err.statusCode = 400
            throw err;
        }
    }
}

schemaUsers.statics.updatePasswordById = async function(credentials) {
    const contraHASH = crypto.HmacSHA1(credentials.pass, process.env.KEY_SHA1).toString(crypto.enc.Hex)
    const idDecode = Buffer.from(credentials.id, 'base64').toString('ascii');
    const result = await this.updateOne({_id: idDecode},{$set: {password: contraHASH}})
    if(result.nModified === 0){
        const err = new Error('Actualizacion no realizada')
        err.body = {
            code: 309,
            msg: "Actualizacion no realizada en base de datos"
        }
        err.statusCode = 400
        throw err;
    }
}

schemaUsers.statics.sendEmailToUser = async function sendEmailToUser(mailOptions, plantilla, datos){
    const templates = new EmailTemplates();
	templates.render(plantilla, datos, function(error, html) {
		if(error){
            const err = new Error('Error con el template')
			err.body = {
                msg: "Error al generar plantilla de correo",
                info: err,
                code: 304
            }
            err.statusCode = 500
            throw err
		}
		mailOptions.html = html
	})
    transporter.sendMail(mailOptions, function(errorSend, infoSend){
		if(errorSend){
			transporter.close();
            const err = new Error('Error al enviar el email')
            err.body = {
                msg: "Error al enviar el email, intenta mas tarde",
                code: 304,
                info: error
            }
            err.statusCode = 500
            throw err;
		}
		transporter.close();
	})
}

schemaUsers.statics.authenticateUser = function authenticateUser(state, passwordDB, passwordUser){
    if(!state){
        const err = new Error('Usuario no verificado')
        err.body = {
            msg: "Por favor verifique su cuenta para continuar",
            code: 308
        }
        err.statusCode = 400
        throw err;
    }else{
        const passwordHASH = crypto.HmacSHA1(passwordUser, process.env.KEY_SHA1).toString(crypto.enc.Hex)
        if(passwordHASH !== passwordDB){
            const err = new Error('Usuario no autenticado')
            err.body = {
                msg: "contrasena incorrecta, intentelo de nuevo",
                code: 306
            }
            err.statusCode = 400
            throw err;
        }
    }
}

schemaUsers.statics.createUser = function createUser(userInfo){
    const self = this;
    const contraHASH = crypto.HmacSHA1(userInfo.pass, process.env.KEY_SHA1)
    const payload = {
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
    const myData = new self(payload)
    myData.save().catch(error => {
        const err = new Error('Error al crear el usuario')
        err.body = {
            msg: "Error al crear el usuario en base de datos",
            code: 304,
            info: error
        }
        err.statusCode = 500
        throw err;
    })
}

schemaUsers.statics.deleteUser = async function(email) {
    const result = await this.deleteOne({correo: Buffer.from(email, 'base64').toString('ascii')})
    if(result.deletedCount === 0){
        const err = new Error('Usuario no existe')
        err.body = {
            msg: "Usuario no existe en base de datos",
            code: 305
        }
        err.statusCode = 400
        throw err;
    }
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

schemaUsers.statics.findOneOrCreateByGoogle = async function(condition, callback){
    try {
        const result = await this.findOne({$or: [{'googleId': condition.profile.id}, {'email': condition.profile.emails[0].value}]})
        if(result){
            return callback(null, result)
        }else{
            const values = {
                googleId: condition.profile.id,
                correo: condition.profile.emails[0].value,
                nombre1: condition.profile._json.given_name || 'SIN NOMBRE',
                apellido1: condition.profile._json.family_name || 'SIN APELLIDO',
                ciudad: "NOT FOUND",
                fecha: new Date(),
                estado: true,
                password: crypto.HmacSHA1(process.env.PWD_OPTIONAL, process.env.KEY_SHA1)
            }
            const resultCreate = this.create(values)
            return callback(null, resultCreate)
        }
    } catch (error) {
        return callback(error, null)
    }
}

module.exports = mongoose.model('Usuarios', schemaUsers);
