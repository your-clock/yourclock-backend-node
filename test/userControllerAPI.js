const server = require("../server");
const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('../config/connectdb');

chai.should();
chai.use(chaiHttp);

const testEmail = "prueba123@correo.com"
const msgEmailInnexist = 'Correo no existente, verifique la informacion'

describe('Controlador api de usuarios', () => {

    before(() => {
        return mockDB.connect()
    });

    it('POST /login success', (done) => {
        chai.request(server)
            .post("/api/user/login")
            .send({
                "mail": testEmail,
                "pass": "P4sSW0rD*",
                "name1": "Usuario",
                "name2": "Prueba",
                "lastName1": "Tests",
                "lastName2": "Unitarios",
                "city": "Bogota"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Usuario registrado correctamente, verifique su correo para autenticar su cuenta')
                res.body.should.have.property('code').eq(300)
                done();
            })
    });

    it('POST /login failed', (done) => {
        chai.request(server)
            .post("/api/user/login")
            .send({
                "mail": testEmail,
                "pass": "123",
                "name1": "Usuario",
                "name2": "Pruebas",
                "lastName1": "Tests",
                "lastName2": "Unitarios",
                "city": "Bogota"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Por favor revise su pass')
                res.body.should.have.property('errorDetail').eq('"pass" length must be at least 8 characters long')
                res.body.should.have.property('errorKey').eq('pass')
                res.body.should.have.property('code').eq(306)
                done();
            })
    });

    it('POST /auth', (done) => {
        chai.request(server)
            .post("/api/user/auth")
            .send({
                "mail": testEmail,
                "pass": "97122110420"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Por favor verifique su cuenta para continuar')
                res.body.should.have.property('code').eq(308)
                done();
            })
    });

    it('POST /verify', (done) => {
        chai.request(server)
            .post("/api/user/verify")
            .send({
                "mail": testEmail
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq(msgEmailInnexist)
                res.body.should.have.property('code').eq(304)
                done();
            })
    });

    it('POST /deleteaccount', (done) => {
        chai.request(server)
            .post("/api/user/deleteaccount")
            .send({
                "mail": "ZWplbXBsb0B0dWRvbWluaW8uY29t"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Usuario no existe en base de datos')
                res.body.should.have.property('code').eq(305)
                done();
            })
    });

    it('POST /forgotpassword success', (done) => {
        chai.request(server)
            .post("/api/user/forgotpassword")
            .send({
                "mail": testEmail
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Mensaje enviado exitosamente, verifique su correo para cambiar su contraseña')
                res.body.should.have.property('code').eq(300)
                done();
            })
    });

    it('POST /forgotpassword failed', (done) => {
        chai.request(server)
            .post("/api/user/forgotpassword")
            .send({
                "mail": "pruebascorreo.com"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Por favor revise su mail')
                res.body.should.have.property('errorDetail').eq('"mail" must be a valid email')
                res.body.should.have.property('errorKey').eq('mail')
                res.body.should.have.property('code').eq(306)
                done();
            })
    });

    it('POST /recoverypassword', (done) => {
        chai.request(server)
            .post("/api/user/recoverypassword")
            .send({
                "id": "NWY5OTBmMDEyZWQ3OWYwMDIzMTdiOWI5",
                "pass": "Erney.garcia1997"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Actualizacion no realizada en base de datos')
                res.body.should.have.property('code').eq(309)
                done();
            })
    });

    it('GET /auth/google', (done) => {
        chai.request(server)
            .get("/api/user/auth/google")
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(200)
                done();
            })
    });
});