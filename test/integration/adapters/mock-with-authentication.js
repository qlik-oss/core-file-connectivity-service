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

    authentication() {
        this.auth = true;
    }
}

module.exports = MockWithAuthentication;
