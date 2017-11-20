const uuid = require('uuid/v1');

class OAuth2Strategy {
  constructor(name, strategy, clientId, clientSecret, scope) {
    this.name = name;
    this.strategy = strategy;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  setupPassportStrategy(callbackUrl){
    this.passportStrategy = new this.strategy({
        clientID: this.clientId,
        clientSecret: this.clientSecret,
        scope: this.scope,
        callbackURL: callbackUrl,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(undefined, accessToken, refreshToken);
      });

    return this.passportStrategy;
  }

  getPassportStrategyName(){
    return this.passportStrategy.name;
  }

  getName(){
    return this.name;
  }
}

module.exports = OAuth2Strategy;
