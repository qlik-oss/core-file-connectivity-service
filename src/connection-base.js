const uuid = require('uuid/v1');

class ConnectionBase {
  constructor(provider, settings) {
    this.id = uuid();
    this.provider = provider;
    this.accessToken = settings.accessToken;
  }

  authenticationCallback(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  authentication() { // eslint-disable-line class-methods-use-this
    return true;
  }

  authenticated() {
    return this.accessToken;
  }

  getProvider() {
    return this.provider;
  }

  getPassportStrategyName() {
    return this.provider.getPassportStrategyName();
  }
}

module.exports = ConnectionBase;
