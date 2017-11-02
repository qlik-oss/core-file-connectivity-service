const GoogleDriveStrategy = require('passport-google-oauth20').Strategy;
const request = require('request-promise');

class GoogleDrive {
  constructor(apiKey, appSecret, fileName) {
    this.apiKey = apiKey;
    this.appSecret = appSecret;
    this.fileName = fileName;
    this.authorizationToken = '';
  }

  initiatedPassportStrategy(callbackUrl) {
    const that = this;

    this.passportStrategy = new GoogleDriveStrategy({
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
    return 'googledrive';
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

  authentication() {
    return true;
  }

  scope() {
    return ['profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];
  }

  authenticated() {
    return this.accessToken;
  }

  getPassportStrategy() {
    return this.passportStrategy;
  }
}

async function getData() {
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

GoogleDrive.getData = getData;

module.exports = GoogleDrive;
