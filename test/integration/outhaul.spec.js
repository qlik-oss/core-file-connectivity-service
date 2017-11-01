const Outhaul = require('../../src/outhaul.js');
// const fs = require("fs");
// const path = require('path');

const request = require('supertest');

class Mock {
    constructor(params) {
        this.params = params;
    }

    getData() {
        return this.params;
    }
}

class MockWithAuthentication {
    constructor(params) {
        this.params = params;
        this.auth = false;
    }

    getData() {
        return this.params;
    }

    authenticated() {
        return this.auth;
    }

    authentication(ctx, next) {
        this.auth = true;
        ctx.body = "authenticated";
    }
}

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

    describe("add connection", () => {
        it("should be possible to a connection", async () => {
            const res = await request(url).post("/connections/add")
                .send({ adapter: "mock", params: []})
                .expect(200);

            expect(res.text).to.not.be.undefined
        });


        it("should be possible to user the url received when /connections/add to invoke getData on the connection", async () => {
            const returnData = "mock data";

            const res = await request(url).post("/connections/add")
                .send({ adapter: "mock", params: [returnData]})
                .expect(200);

            const finalRes = await request(url).get(res.text);
            expect(finalRes.text).to.eql(returnData);
        });

        it("should receive 401 if trying to access a connection that is protected", async () => {
            const returnData = "mock data";

            const res = await request(url).post("/connections/add")
                .send({ adapter: "mock_with_authentication", params: [returnData]})
                .expect(200);

            const finalRes = await request(url).get(res.text).expect(401);
            expect(finalRes.text).to.eql('Authentication is needed to access this connection.');
        });

        it("should be possible to access data if a connection is authenticated", async () => {
            const returnData = "mock data";

            const res = await request(url).post("/connections/add")
                .send({ adapter: "mock_with_authentication", params: [returnData]})
                .expect(200);

            await request(url).get(res.text).expect(401);

            await request(url).get(res.text + '/authentication').expect(200);

            const finalRes = await request(url).get(res.text).expect(200);
            expect(finalRes.text).to.eql(returnData);
        });
    });
});

after(() => {
    outhaul.close();
});
