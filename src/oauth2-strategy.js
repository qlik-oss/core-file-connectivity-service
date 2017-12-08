const logger = require('./logger').get();

class OAuth2Strategy {
  constructor(name, strategy, clientId, clientSecret, scope) {
    this.name = name;
    this.Strategy = strategy;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  setupPassportStrategy(callbackUrl, options) {
    const additionalOptions = options || {};

    if (this.clientId && this.clientSecret) {
      this.passportStrategy = new this.Strategy(
        Object.assign({
          clientID: this.clientId,
          clientSecret: this.clientSecret,
          scope: this.scope,
          callbackURL: callbackUrl,
        }, additionalOptions),
        (accessToken, refreshToken, profile, done) => done(undefined, accessToken, refreshToken),
      );
    } else {
      logger.warn(`No OAuth clientId or clientSecret provided for ${this.name}`);
    }

    return this.passportStrategy;
  }

  getPassportStrategyName() {
    return this.passportStrategy.name;
  }

  getName() {
    return this.name;
  }
}

module.exports = OAuth2Strategy;
