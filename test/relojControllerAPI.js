const server = require("../server");
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

describe('Controlador api de reloj', () => {

    it('POST /datos', (done) => {
        chai.request(server)
            .post("/api/reloj/datos")
            .set("device_id", 114)
            .send({
                "temp_amb": 30,
                "temp_local": 50
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(200)
                res.body.should.be.a('object')
                done();
            })
    });

    it('POST /datos failed', (done) => {
        chai.request(server)
            .post("/api/reloj/datos")
            .send({
                "temp_amb": 30,
                "temp_local": 50
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('msg').eq('Faltaron datos, por favor valide la informacion')
                res.body.should.have.property('code').eq(310)
                done();
            })
    });

    it('POST /alarma', (done) => {
        chai.request(server)
            .post("/api/reloj/alarma")
            .send({
                "time": "99:99"
            })
            .end((err, res) => {
                if(err){
                    throw err;
                }
                console.log(res.body);
                res.should.have.status(500)
                res.body.should.be.a('object')
                res.body.should.have.property('info').eq('The "url" argument must be of type string. Received undefined')
                res.body.should.have.property('msg').eq('Error al intentar configurar la alarma')
                res.body.should.have.property('code').eq(401)
                done();
            })
    })
});
