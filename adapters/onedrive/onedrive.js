const OneDrivePassportStrategy = require('passport-onedrive').Strategy;
const request = require('request-promise');

const OAuth2Strategy = require('../../src/oauth2-strategy');
const ConnectionBase = require('../../src/connection-base');

class OneDrive extends ConnectionBase {
  constructor(strategy, fileName) {
    super(strategy, OneDrivePassportStrategy);
    this.fileName = fileName;
  }

  async getData() {
    console.log('accesstoken', this.accessToken);
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
    return new OneDrive(this, ...params);
  }
}

module.exports = OneDriveStrategy;
