const server = require("../server");
const chai = require('chai');
const chaiHttp = require('chai-http');
const mockDB = require('../config/connectdb');

chai.should();
chai.use(chaiHttp);

describe('Controlador api de reloj', () => {

    before(() => {
        return mockDB.connect()
    });

    it('POST /datos', (done) => {
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
                res.should.have.status(200)
                res.body.should.be.a('object')
                done();
            })
    });
});
