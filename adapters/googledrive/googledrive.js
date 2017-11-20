const GoogleDriveStrategy = require('passport-google-oauth20').Strategy;
const request = require('request-promise');

const OAuth2Strategy = require('../../src/oauth2-strategy');

class GoogleDrive extends OAuth2Strategy {
  constructor(fileName) {
    super(GoogleDriveStrategy);
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

  getPassportStrategyName(){
    return GoogleDrive.passportStrategyName;
  }
}

GoogleDrive.configure = function(clientId, clientSecret){
  GoogleDrive.clientId = clientId;
  GoogleDrive.clientSecret = clientSecret;
  GoogleDrive.scope = ['profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];
}

GoogleDrive.name = "GoogleDrive";

GoogleDrive.PassportStrategy = GoogleDriveStrategy;

module.exports =  GoogleDrive;
