const OneDrivePassportStrategy = require('passport-onedrive').Strategy;
const request = require('request-promise-native');

const OAuth2Strategy = require('../../oauth2-strategy');
const ConnectionBase = require('../../connection-base');
const logger = require('../../logger').get();

class OneDrive extends ConnectionBase {
  constructor(strategy, settings) {
    super(strategy, settings);
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

class OneDriveStrategy extends OAuth2Strategy {
  constructor(clientId, clientSecret) {
    const scope = ['onedrive.readwrite'];
    super('OneDrive', OneDrivePassportStrategy, clientId, clientSecret, scope);
    this.connector = OneDrive;
  }

  newConnector(params) {
    return new OneDrive(this, params);
  }
}

module.exports = OneDriveStrategy;
