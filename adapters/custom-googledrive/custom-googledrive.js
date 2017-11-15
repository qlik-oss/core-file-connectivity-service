const request = require('request-promise');
const google = require('googleapis');
const generateUuid = require('uuid/v1');

let OAuth2 = google.auth.OAuth2;
let auth;

class CustomGoogleDrive {
  constructor(clientId, secret, fileName ) {
    this.clientId = clientId;
    this.secret = secret;
    this.fileName = fileName;
    this.accessToken;

    this.id = generateUuid();
  }

  async getData() {
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

  uuid(){
    return this.id;
  }

  authenticated() {
    return this.accessToken;
  }

  authenticationCallbackUrl(){
    return this.redirectUrl;
  }


  async authenticationCallback(authorizationCode) {
    let that = this;

    return await auth.getToken(authorizationCode, async function (err, tokens) {
      if (!err) {
        that.accessToken = tokens.access_token;
        return true;
      }
      else{
        return false;
      }
    });
  }

  authentication(ctx) {
    var scopes = [
      'profile',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly'
    ];

    auth = new OAuth2(
      this.clientId,
      this.secret,
      this.redirectUrl
    );

    var url = auth.generateAuthUrl({
      access_type: 'online',
      scope: scopes,
      state: this.uuid()
    });

    return ctx.redirect(url);
  }
}

module.exports = CustomGoogleDrive;

