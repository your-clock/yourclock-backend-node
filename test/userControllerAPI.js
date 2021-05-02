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

    it('POST /login', (done) => {
        chai.request(server)
            .post("/api/user/login")
            .send({
                "mail": testEmail,
                "pass": "97122110420",
                "name1": "Erney",
                "name2": "David",
                "lastName1": "Garcia",
                "lastName2": "Vergara",
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
                res.body.should.have.property('msg').eq(msgEmailInnexist)
                res.body.should.have.property('code').eq(304)
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

    it('POST /forgotpassword', (done) => {
        chai.request(server)
            .post("/api/user/forgotpassword")
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
