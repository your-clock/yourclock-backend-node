const server = require("../server");
const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('../config/connectdb');

chai.should();
chai.use(chaiHttp);

describe('Controlador api de reloj', () => {

    before(async () => await mockDB.connect());

    it('POST /datos', (done) => {
        chai.request(server)
            .post("/api/reloj/datos")
            .send({
                "temp_amb": 30,
                "temp_local": 50
            })
            .end((err, res) => {
                if (err) throw err;
                res.should.have.status(200)
                res.body.should.be.a('object')
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
                if (err) throw err;
                console.log(res.body)
                res.should.have.status(200)
                res.body.should.be.a('object')
                done();
            })
    });
});