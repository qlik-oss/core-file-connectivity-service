const GoogleDriveStrategy = require('passport-google-oauth20').Strategy;
const request = require('request-promise');
const generateUuid = require('uuid/v1');


class GoogleDrive {
  constructor(apiKey, appSecret, fileName) {
    this.apiKey = apiKey;
    this.appSecret = appSecret;
    this.fileName = fileName;
    this.authorizationToken = '';
    this.name = 'googledrive';
    this.authentication = true;
    this.scope = ['profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];

    this.id = generateUuid();

  }

  initiatedPassportStrategy(callbackUrl) {
    this.passportStrategy = new GoogleDriveStrategy({
      clientID: this.apiKey,
      clientSecret: this.appSecret,
      callbackURL: callbackUrl,
    },
      (accessToken, refreshToken, profile, done) => {
        return done(undefined, accessToken);
      });
  }


  uuid(){
    return this.id;
  }

  getName() {
    return this.name;
  }

  authenticationCallback(accessToken) {
    console.log("Got accessToken!!!!");
    this.accessToken = accessToken;
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
    return this.authentication;
  }

  scope() {
    return this.scope;
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
