const GoogleDrivePassportStrategy = require('passport-google-oauth20').Strategy;
const request = require('request-promise');

const OAuth2Strategy = require('../../src/oauth2-strategy');
const ConnectionBase = require('../../src/connection-base');

class GoogleDrive extends ConnectionBase {
  constructor(strategy, fileName) {
    super(strategy, GoogleDrivePassportStrategy);
    this.fileName = fileName;
  }

  async getData() {
    // Fetch the filelist and match that with the fileName to get file id
    const response = await request({
      url: 'https://www.googleapis.com/drive/v3/files',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const jsonbody = JSON.parse(response);
    const file = jsonbody.files.find(f => f.name === this.fileName);

    const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;

    return request({
      url,
      encoding: null,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }
}

class GoogleDriveStrategy extends OAuth2Strategy {
  constructor(clientId, clientSecret) {
    const scope = ['profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];
    super('GoogleDrive', GoogleDrivePassportStrategy, clientId, clientSecret, scope);
    this.connector = GoogleDrive;
  }

  newConnector(params) {
    return new GoogleDrive(this, ...params);
  }
}

module.exports = GoogleDriveStrategy;
