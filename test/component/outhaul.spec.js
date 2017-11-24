const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const Mock = require('./strategies/mock');
const MockWithAuthentication = require('./strategies/mock-with-authentication');
const MockWithLocalPassport = require('./strategies/mock-with-local-passport');

const strategies = [
  Mock,
  MockWithAuthentication,
  MockWithLocalPassport,
];

let outhaul;

before(() => {
  outhaul = Outhaul({
    port: 3000,
    strategies,
  });
  outhaul.start();
});

const url = 'http://localhost:3000';

describe.skip('outhaul', () => {
  it('should return ok from health endpoint', async () => {
    const res = await request(url).get('/health');
    expect(res.statusCode).to.eql(200);
  });

  const returnData = 'mock data';

  it("should have access to data if a connection doesn't require authentication", async () => {
    const res = await request(url).post('/connections/add')
      .send({
        connector: 'mock',
        params: [returnData],
      })
      .expect(200);

    const finalRes = await request(url).get(res.text);
    expect(finalRes.text).to.eql(returnData);
  });

  it('should have access to data if a connection is authenticated', async () => {
    const res = await request(url).post('/connections/add')
      .send({
        connector: 'mock_with_authentication',
        params: [returnData],
      })
      .expect(200);

    await request(url).get(res.text).expect(401);

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


  it('should be possible to register multiple connections with ');


  // not possible to register multiple logins with the same strategy
});

after(() => {
  outhaul.close();
});
