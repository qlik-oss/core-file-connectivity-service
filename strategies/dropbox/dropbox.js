const DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
const request = require('request');


class Dropbox {
  constructor(apiKey, appSecret, filePath, accessToken) {
    this.apiKey = apiKey;
    this.appSecret = appSecret;
    this.filePath = filePath;
    this.accessToken = accessToken;
    this.name = 'dropbox';
    this.authentication = true;
  }

  initiatedPassportStrategy(callbackUrl) {
    const that = this;

    this.passportStrategy = new DropboxOAuth2Strategy({
      apiVersion: '2',
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
    return this.name;
  }

  getData() {
    return Dropbox.getData(this.filePath, this.accessToken);
  }

  authentication() {
    return this.authentication;
  }

  authenticated() {
    return this.accessToken;
  }

  getPassportStrategy() {
    return this.passportStrategy;
  }
}

function getData(filePath, accessToken) {
  return request({
    url: 'https://content.dropboxapi.com/2/files/download',
    headers: {
      'Dropbox-API-Arg': `{"path": "${filePath}"}`,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

Dropbox.getData = getData;

module.exports = Dropbox;
