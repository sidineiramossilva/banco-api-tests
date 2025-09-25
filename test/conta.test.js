const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config()
const { obterToken } = require('../helpers/autenticacao')

describe('Contas', () => {
    let token

    beforeEach(async() => {
        token = await obterToken('julio.lima', '123456')
    })

    describe('GET /contas/{id}', () => {
        it('Deve retornar sucesso com 200 e dados iguais ao registro de conta contido no banco de dados quando o ID for válido', async () => {
            const resposta = await request(process.env.BASE_URL)
                .get('/contas/1')
                .set('Authorization', `Bearer ${token}`)
            expect(resposta.status).to.equal(200)
            expect(resposta.body.id).to.equal(1)
            expect(resposta.body.id).to.be.a('number')
            expect(resposta.body.titular).to.equal('João da Silva')
            expect(resposta.body.ativa).to.equal(1)
        })
    })
})