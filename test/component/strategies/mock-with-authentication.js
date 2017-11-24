class MockWithAuthentication {
  constructor(params) {
    this.params = params;
    this.auth = false;
    this.name = 'MockWithAuthentication';
    this.strategyName = 'MockWithAuthentication';
    this.uuid = '1234';
  }

  getName() {
    return this.name;
  }

  newConnector() {
    return {
      uuid: () => this.uuid,
      getData: () => this.params,
      authenticated: () => this.auth,
      authentication: () => { this.auth = true; },
      getPassportStrategyName: () => this.strategyName,
    };
  }
}

module.exports = MockWithAuthentication;
