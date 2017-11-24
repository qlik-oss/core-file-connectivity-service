const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const Mock = require('./strategies/mock');
const MockWithAuthentication = require('./strategies/mock-with-authentication');
const MockWithLocalPassport = require('./strategies/mock-with-local-passport');

const returnData = 'mock data';
const strategies = [
  new Mock(returnData),
  new MockWithAuthentication(returnData),
  new MockWithLocalPassport(returnData),
];

let outhaul;

beforeEach(() => {
  outhaul = Outhaul({
    port: 3000,
    strategies,
  });
  outhaul.start();
});

const url = 'http://localhost:3000';

describe('outhaul', () => {
  describe('GET /health', () => {
    it('should return ok from health endpoint', async () => {
      const res = await request(url).get('/health');
      expect(res.statusCode).to.eql(200);
    });
  });

  describe('POST /connections/add', () => {
    it('should return 400 if connector was not specified', async () => {
      await request(url).post('/connections/add')
        .send({
          params: [returnData],
        })
        .expect(400);
    });

    it('should return 404 for a nonexisting connector', async () => {
      await request(url).post('/connections/add')
        .send({
          connector: 'Nonexisting_Connector',
          params: [returnData],
        })
        .expect(404);
    });

    it("should have access to data if a connection doesn't require authentication", async () => {
      const res = await request(url).post('/connections/add')
        .send({
          connector: 'Mock',
          params: [returnData],
        })
        .expect(200);

      const finalRes = await request(url).get(res.text);
      expect(finalRes.text).to.eql(returnData);
    });

    it('should not have access to data if a connection is not authenticated', async () => {
      const res = await request(url).post('/connections/add')
        .send({
          connector: 'MockWithAuthentication',
          params: [returnData],
        })
        .expect(200);

      await request(url).get(res.text).expect(401);
    });

    it.skip('should have access to data if a connection is authenticated', async () => {
      const res = await request(url).post('/connections/add')
        .send({
          connector: 'MockWithAuthentication',
          params: [returnData],
        })
        .expect(200);

      await request(url).post(`${res.text}/authentication`).expect(200);

      const finalRes = await request(url).get(res.text).expect(200);
      expect(finalRes.text).to.eql(returnData);
    });

    it.skip('should be authenticatate with local passport strategy', async () => {
      const res = await request(url).post('/connections/add')
        .send({
          connector: 'mock_with_local_passport',
          params: [returnData, 'admin', 'password'],
        })
        .expect(200);

      await request(url).get(res.text).expect(401);


      // Faulty login attempt
      await request(url)
        .post(`${res.text}/authentication`)
        .send({
          username: 'wrong',
          password: 'faulty',
        });

      await request(url).get(res.text).expect(401);


      // Correct login
      await request(url)
        .post(`${res.text}/authentication`)
        .send({
          username: 'admin',
          password: 'password',
        });

      const finalRes = await request(url).get(res.text).expect(200);
      expect(finalRes.text).to.eql(returnData);
    });


    it.skip('should be possible to register multiple connections with ');

  });

  // not possible to register multiple logins with the same strategy
});

afterEach(() => {
  outhaul.close();
});
