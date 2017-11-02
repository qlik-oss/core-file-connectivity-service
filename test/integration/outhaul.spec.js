const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const Mock = require('./adapters/mock');
const MockWithAuthentication = require('./adapters/mock-with-authentication');

let adapters = {mock: Mock, mock_with_authentication: MockWithAuthentication};

let outhaul;

before(() => {
    outhaul = Outhaul({ port: 3000, adapters: adapters });
    outhaul.start();
});

const url = 'http://localhost:3000';

describe("outhaul", () => {
    it("should return ok from health endpoint", async () => {
        const res = await request(url).get('/health');
        expect(res.statusCode).to.eql(200);
    });

    const returnData = "mock data";

    it("should have access to data if a connection doesn't require authentication", async () => {
        const res = await request(url).post("/connections/add")
            .send({ adapter: "mock", params: [returnData]})
            .expect(200);

        const finalRes = await request(url).get(res.text);
        expect(finalRes.text).to.eql(returnData);
    });

    it("should have access to data if a connection is authenticated", async () => {
        const res = await request(url).post("/connections/add")
            .send({ adapter: "mock_with_authentication", params: [returnData]})
            .expect(200);

        await request(url).get(res.text).expect(401);

        await request(url).get(res.text + '/authentication').expect(200);

        const finalRes = await request(url).get(res.text).expect(200);
        expect(finalRes.text).to.eql(returnData);
    });
});

after(() => {
    outhaul.close();
});
