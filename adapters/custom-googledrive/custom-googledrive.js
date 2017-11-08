const request = require('request-promise');
const google = require('googleapis');

let OAuth2 = google.auth.OAuth2;
let auth;

class CustomGoogleDrive {
  constructor(clientId, secret, redirectUrl, fileName ) {
    this.clientId = clientId;
    this.secret = secret;
    this.redirectUrl = redirectUrl;
    this.fileName = fileName;

    this.accessToken;
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

  authenticated() {
    return this.accessToken;
  }

  async authenticationCallback(ctx) {
    let code = ctx.request.querystring.replace('code=', '');

    let that = this;

    await auth.getToken(code, function (err, tokens) {
      if (!err) {
        that.accessToken = tokens.access_token;
        ctx.response.body = "ok";
        return ctx;
      }
    });
  }

  authentication(ctx, redirectUrl) {
    var scopes = [
      'profile',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly'
    ];

    auth = new OAuth2(
      this.clientId,
      this.secret,
      redirectUrl
    );

    var url = auth.generateAuthUrl({
      access_type: 'online',
      scope: scopes,
    });

    return ctx.redirect(url);
  }
}

module.exports = CustomGoogleDrive;

