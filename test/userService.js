const userService = require('../src/services/users')
const chai = require('chai');
const path = require('path');

chai.should();

describe('Services de usuarios', () => {

    it('service updateStateByEmail failed', async () => {
        try {
            await userService.updateStateByEmail("prueba@correo.com", true);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });

    it('service updateStateByEmail', async () => {
        try {
            await userService.updateStateByEmail("prueba@correo.com", false);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });

    it('service sendEmailToUser', async () => {
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
        await userService.sendEmailToUser(mailOptions, plantilla, datos);
    });

    it('service sendEmailToUser failed', async () => {
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
            await userService.sendEmailToUser(mailOptions, plantilla, datos);
        } catch (error) {
            error.body.should.be.a('object')
        }
    });
    it('service authenticateUser failed', async () => {
        try{
            await userService.authenticateUser(true, "123456", "123456");
        } catch (error) {
            error.body.should.be.a('object')
        }
    });
});