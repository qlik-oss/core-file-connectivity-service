const OneDrivePassportStrategy = require('passport-onedrive').Strategy;
const request = require('request-promise-native');

const OAuth2Provider = require('../../oauth2-provider');
const ConnectionBase = require('../../connection-base');
const logger = require('../../logger').get();

class OneDrive extends ConnectionBase {
  constructor(provider, settings) {
    super(provider, settings);
    this.fileName = settings.fileName;
  }

  async getData() {
    logger.debug('accesstoken', this.accessToken);
    return request({
      url: `https://api.onedrive.com/v1.0/drive/root:${this.fileName}:/content`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }
}

class OneDriveProvider extends OAuth2Provider {
  constructor() {
    const clientId = process.env.ONE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.ONE_DRIVE_CLIENT_SECRET;

    const scope = ['onedrive.readwrite'];
    super('OneDrive', OneDrivePassportStrategy, clientId, clientSecret, scope);
    this.connector = OneDrive;
  }

  newConnector(params) {
    return new OneDrive(this, params);
  }
}

module.exports = OneDriveProvider;
