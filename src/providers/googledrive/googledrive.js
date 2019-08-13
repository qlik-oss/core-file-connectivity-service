const GoogleDrivePassportStrategy = require('passport-google-oauth20').Strategy;
const request = require('request-promise-native');

const OAuth2Provider = require('../../oauth2-provider');
const ConnectionBase = require('../../connection-base');

class GoogleDrive extends ConnectionBase {
  constructor(provider, settings) {
    super(provider, settings);
    this.fileName = settings.fileName;
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
    const file = jsonbody.files.find((f) => f.name === this.fileName);
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

class GoogleDriveProvider extends OAuth2Provider {
  constructor() {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

    const scope = ['profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];
    super('GoogleDrive', GoogleDrivePassportStrategy, clientId, clientSecret, scope);
    this.connector = GoogleDrive;
  }

  newConnector(params) {
    return new GoogleDrive(this, params);
  }
}

module.exports = GoogleDriveProvider;
