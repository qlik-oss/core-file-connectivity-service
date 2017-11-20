const uuid = require('uuid/v1');

class ConnectionBase {
  constructor(strategy, accessToken) {
    this.id = uuid();
    this.strategy = strategy;
    this.accessToken = undefined;
  }

  uuid() {
    return this.id;
  }

  authenticationCallback(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  authentication() {
    return true;
  }

  authenticated() {
    return this.accessToken;
  }

  getStrategy() {
    return this.strategy;
  }

  getPassportStrategyName(){
    return this.strategy.getPassportStrategyName();
  }
}

module.exports = ConnectionBase;
