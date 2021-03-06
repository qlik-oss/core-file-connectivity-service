const DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
const request = require('request');

const OAuth2Provider = require('../../oauth2-provider');
const ConnectionBase = require('../../connection-base');

class Dropbox extends ConnectionBase {
  constructor(provider, settings) {
    super(provider, settings);
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

class DropboxProvider extends OAuth2Provider {
  constructor() {
    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

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

module.exports = DropboxProvider;
