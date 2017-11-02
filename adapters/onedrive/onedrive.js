const OneDriveStrategy = require('passport-onedrive').Strategy;
const request = require('request');


class OneDrive {
  constructor(apiKey, appSecret, filePath) {
    this.apiKey = apiKey;
    this.appSecret = appSecret;
    this.filePath = filePath;
    this.authorizationToken = '';
  }

  initiatedPassportStrategy(callbackUrl) {
    const that = this;

    this.passportStrategy = new OneDriveStrategy({
      clientID: this.apiKey,
      clientSecret: this.appSecret,
      callbackURL: callbackUrl,
    },
      (accessToken, refreshToken, profile, done) => {
        that.accessToken = accessToken;
        return done(undefined, profile);
      });
  }

  getName() {
    return 'onedrive';
  }

  getData() {
    return OneDrive.getData(this.filePath, this.accessToken);
  }

  authentication() {
    return true;
  }

  scope() {
    return ['onedrive.readwrite'];
  }

  authenticated() {
    return this.accessToken;
  }

  getPassportStrategy() {
    return this.passportStrategy;
  }
}

OneDrive.getData = function getData(filePath, accessToken) {
  return request({
    url: `https://api.onedrive.com/v1.0/drive/root:${filePath}:/content`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

module.exports = OneDrive;
