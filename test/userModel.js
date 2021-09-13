const userModel = require('../src/services/users')
const chai = require('chai');
const path = require('path');

chai.should();

describe('Modelos de usuarios', () => {

    it('model updateStateByEmail failed', async () => {
        try {
            await userModel.updateStateByEmail("prueba@correo.com", true);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });

    it('model updateStateByEmail', async () => {
        try {
            await userModel.updateStateByEmail("prueba@correo.com", false);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });

    it('model sendEmailToUser', async () => {
        var mailOptions = {
            from: 'yourclocknoreply@gmail.com',
            to: "prueba@correo.com",
            subject: 'Cambio de contraseña en Your Clock'
        };
        var plantilla = path.join(__dirname, '..', 'views/forgotPassword.html')
        var datos = {
            nombre: "Pepito",
            id: "123erfgbgr43rgr4efgfe3fg",
            base_url: "http://localhost:8080"
        }
        await userModel.sendEmailToUser(mailOptions, plantilla, datos);
    });

    it('model sendEmailToUser failed', async () => {
        try{
            var mailOptions = {
                from: 'yourclocknoreply@gmail.com',
                to: "prueba@correo.com",
                subject: 'Cambio de contraseña en Your Clock'
            };
            var plantilla = path.join(__dirname, '../..', 'views/forgotPassword.html')
            var datos = {
                nombre: "Pepito",
                id: "123erfgbgr43rgr4efgfe3fg",
                base_url: "http://localhost:8080"
            }
            await userModel.sendEmailToUser(mailOptions, plantilla, datos);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });
    it('model authenticateUser failed', async () => {
        try{
            await userModel.authenticateUser(true, "123456", "123456");
        } catch (error) {
            error.body.should.be.a('object')
        }
    });
});