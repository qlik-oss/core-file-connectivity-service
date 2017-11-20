class OAuth2Strategy {
  constructor(name, strategy, clientId, clientSecret, scope) {
    this.name = name;
    this.Strategy = strategy;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  setupPassportStrategy(callbackUrl) {
    this.passportStrategy = new this.Strategy({
      clientID: this.clientId,
      clientSecret: this.clientSecret,
      scope: this.scope,
      callbackURL: callbackUrl,
    },
      (accessToken, refreshToken, profile, done) => done(undefined, accessToken, refreshToken));

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
