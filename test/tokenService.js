const tokenService = require('../src/services/token')
const chai = require('chai');
var tokenTest;

chai.should();

describe('Services de token', () => {
    it('service createToken', async () => {
        const tokenData = {
            "nombre": "RXJuZXk=",
            "correo": "ZWplbXBsb0B0dWRvbWluaW8uY29t",
            "id": "NWY5M2NkNTI4NjdlYjE1MmVjMjUwY2Uz"
        }
        tokenTest = await tokenService.createToken(tokenData);
        tokenTest.should.be.a('String')
    });

    it('service verifyToken', async () => {
        const result = await tokenService.verifyToken(tokenTest);
        result.should.be.a('Boolean')
    });

    it('service updateToken', async () => {
        await tokenService.updateToken(tokenTest);
    });
});