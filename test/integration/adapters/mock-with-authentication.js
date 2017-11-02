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

  authentication(ctx) {
    this.auth = true;
    ctx.body = 'authenticated';
  }
}

module.exports = MockWithAuthentication;
