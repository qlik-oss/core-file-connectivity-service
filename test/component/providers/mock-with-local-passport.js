const LocalStrategy = require('passport-local').Strategy;

const OAuth2Provider = require('../../../src/oauth2-provider');
const ConnectionBase = require('../../../src/connection-base');

class MockWithLocalPassport extends ConnectionBase {
  constructor(provider, settings) {
    super(provider, settings);
    this.returnData = settings.returnData;
    this.name = 'MockWithLocalPassport';
  }

  getData() {
    return this.returnData;
  }
}

class MockWithLocalPassportStrategy extends OAuth2Provider {
  constructor(returnData, clientId, clientSecret) {
    super('MockWithLocalPassport', LocalStrategy, clientId, clientSecret);
    this.connector = MockWithLocalPassport;
    this.returnData = returnData;
  }

  newConnector() {
    return new MockWithLocalPassport(this, { returnData: this.returnData });
  }

  setupPassportStrategy(callbackUrl) {
    return super.setupPassportStrategy(callbackUrl, {
      apiVersion: '2',
    });
  }
}

module.exports = MockWithLocalPassportStrategy;
