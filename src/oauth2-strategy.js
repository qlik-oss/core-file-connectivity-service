const uuid = require('uuid/v1');

class OAuth2Strategy {
  constructor(passportStrategy, accessToken) {
    this.id = uuid();
    this.passportStrategy = passportStrategy;
    this.accessToken = undefined;
  }

  uuid() {
    return this.id;
  }

  authenticationCallback(accessToken) {
    this.accessToken = accessToken;
  }

  authentication() {
    return true;
  }

  authenticated() {
    return this.accessToken;
  }

  getPassportStrategy() {
    return this.passportStrategy;
  }
}

module.exports = OAuth2Strategy;
