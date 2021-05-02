const server = require("../server");
const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('../config/connectdb');

chai.should();
chai.use(chaiHttp);

const dataToken = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZTA4ZGVmMDMtM2M4OS00MGQ5LWI2YWYtNmU2ZTRmMjE0NGQ0IiwiaWF0IjoxNjE5NDI0MjkwfQ.dcU_tpprafTWQ_pOcCMzEa75HNPIzaeYiDbgDhOJ4Mw" //NOSONAR
}

describe('Controlador api de token', () => {

    before(() => {
        return mockDB.connect()
    });

    it('POST /createtoken', (done) => {
        chai.request(server)
            .post("/api/token/createtoken")
            .send({
                "tokenData": {
                        "nombre": "RXJuZXk=",
                        "correo": "ZWplbXBsb0B0dWRvbWluaW8uY29t",
                        "id": "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz"
                }
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Token creado correctamente')
                res.body.should.have.property('code').eq(300)
                res.body.should.have.property('token')
                done();
            })
    });

    it('POST /verifytoken', (done) => {
        chai.request(server)
            .post("/api/token/verifytoken")
            .send(dataToken)
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(200)
                res.body.should.be.a('boolean')
                res.body.should.be.eq(false)
                done();
            })
    });

    it('POST /updatetoken', (done) => {
        chai.request(server)
            .post("/api/token/updatetoken")
            .send(dataToken)
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(500)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Su token se ha vencido, ingrese de nuevo')
                res.body.should.have.property('code').eq(304)
                done();
            })
    });

    it('POST /deletetoken', (done) => {
        chai.request(server)
            .post("/api/token/deletetoken")
            .send(dataToken)
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Token eliminado exitosamente de redis')
                res.body.should.have.property('code').eq(301)
                done();
            })
    });
});
