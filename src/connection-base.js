const uuid = require('uuid/v1');

class ConnectionBase {
  constructor(strategy, accessToken) {
    this.id = uuid();
    this.strategy = strategy;
    this.accessToken = accessToken;
  }

  uuid() {
    return this.id;
  }

  authenticationCallback(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  authentication() {  // eslint-disable-line class-methods-use-this
    return true;
  }

  authenticated() {
    return this.accessToken;
  }

  getStrategy() {
    return this.strategy;
  }

  getPassportStrategyName() {
    return this.strategy.getPassportStrategyName();
  }
}

module.exports = ConnectionBase;
