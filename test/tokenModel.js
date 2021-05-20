const tokenModel = require('../models/token')
const chai = require('chai');
var tokenTest;

chai.should();

describe('Modelos de tokens', () => {
    it('model createToken', async () => {
        const tokenData = {
            "nombre": "RXJuZXk=",
            "correo": "ZWplbXBsb0B0dWRvbWluaW8uY29t",
            "id": "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz"
        }
        tokenTest = await tokenModel.createToken(tokenData);
        tokenTest.should.be.a('String')
    });

    it('model verifyToken', async () => {
        const result = await tokenModel.verifyToken(tokenTest);
        result.should.be.a('Boolean')
    });

    it('model updateToken', async () => {
        await tokenModel.updateToken(tokenTest);
    });
});