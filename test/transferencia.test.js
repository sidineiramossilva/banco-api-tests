const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config()
const { obterToken } = require('../helpers/autenticacao')
const postTransferencias = require('../fixtures/postTransferencias.json')

describe('Transferências', () => {
    let token

    beforeEach(async() => {
        token = await obterToken('julio.lima', '123456')        
    })

    describe('POST /transferencias', () => {
        it('Deve retornar sucesso com 201 quando o valor da transferência for igual ou acima de R$ 10,00', async () => {     
            const bodyTransferencias = { ...postTransferencias}
            
            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(201);
            expect(resposta.text).to.contain('Transferência realizada com sucesso.')
        })

        it('Deve retornar falha com 400 quando informado parâmetros de transferência inválidos', async () => {     
            const bodyTransferencias = { ...postTransferencias}
            bodyTransferencias.contaOrigem = 'Pedro'
            
            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(400);
            expect(resposta.error.text).to.contain('Parâmetros de transferência inválidos')
        })

        it('Deve retornar falha com 401 quando não for passado token e o valor da transferência for maior ou igual a R$5000', async () => {     
            const bodyTransferencias = { ...postTransferencias}
            bodyTransferencias.valor = 5000
            bodyTransferencias.token = ""
            
            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(401);
            expect(resposta.error.text).to.contain('Autenticação necessária para transferências acima de R$5.000,00.')
        })

        it('Deve retornar falha com 401 quando passado token invalido e o valor da transferência for maior ou igual a R$5000', async () => {     
            const bodyTransferencias = { ...postTransferencias}
            bodyTransferencias.valor = 5000
            bodyTransferencias.token = "123456789"
            
            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(401);
            expect(resposta.error.text).to.contain('Autenticação necessária para transferências acima de R$5.000,00.')
        })

        it('Deve retornar falha com 403 quando fornecido um token sem acesso permitido', async () => {     
            const bodyTransferencias = { ...postTransferencias}

            tokenAuthentication = await obterToken('junior.lima', '123456')
            
            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAuthentication}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(403);
            expect(resposta.error.text).to.contain('Acesso não permitido.')
        })

        it('Deve retornar falha com 422 quando o valor da transferência for abaixo de R$ 10,00', async () => {            
            const bodyTransferencias = { ...postTransferencias}
            bodyTransferencias.valor = 7

            const resposta = await request(process.env.BASE_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(bodyTransferencias)
            expect(resposta.status).to.equal(422);
            expect(resposta.error.text).to.contain('O valor da transferência deve ser maior ou igual a R$10,00.')
        })
    })

    describe('GET /transferencias/{id}', () => {
        it('Deve retornar sucesso com 200 e dados iguais ao registro de transferência contido no banco de dados quando o ID for válido', async () => {
            const resposta = await request(process.env.BASE_URL)
                .get('/transferencias/7')
                .set('Authorization', `Bearer ${token}`)
            expect(resposta.status).to.equal(200)
            expect(resposta.body.id).to.equal(7)
            expect(resposta.body.id).to.be.a('number')
            expect(resposta.body.conta_origem_id).to.equal(1)
            expect(resposta.body.conta_destino_id).to.equal(2)
            expect(resposta.body.valor).to.equal(11.00)
        })
    })

    describe('GET /transferencias', () => {
        it('Deve retornar 10 elementos na paginação quando informar limite de 10 registros', async () => {
            const resposta = await request(process.env.BASE_URL)
                .get('/transferencias?page=1&limit=10')
                .set('Authorization', `Bearer ${token}`)
            expect(resposta.status).to.equal(200)
            expect(resposta.body.limit).to.equal(10)
            expect(resposta.body.transferencias).to.have.lengthOf(10)
        })
    })
})