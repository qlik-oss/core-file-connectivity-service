const DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
const request = require('request');

const OAuth2Strategy = require('../oauth2-strategy');
const ConnectionBase = require('../connection-base');

class Dropbox extends ConnectionBase {
  constructor(strategy, settings) {
    super(strategy, settings);
    this.filePath = settings.filePath;
  }

  getData() {
    return request({
      url: 'https://content.dropboxapi.com/2/files/download',
      headers: {
        'Dropbox-API-Arg': `{"path": "${this.filePath}"}`,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }
}

class DropboxStrategy extends OAuth2Strategy {
  constructor(options) {
    const { clientId, clientSecret } = options;
    super('Dropbox', DropboxOAuth2Strategy, clientId, clientSecret);
    this.connector = Dropbox;
  }

  newConnector(params) {
    return new Dropbox(this, params);
  }

  setupPassportStrategy(callbackUrl) {
    return super.setupPassportStrategy(callbackUrl, { apiVersion: '2' });
  }
}

module.exports = DropboxStrategy;
