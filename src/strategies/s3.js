const AWS = require('aws-sdk');
const ConnectionBase = require('../connection-base');

class S3 extends ConnectionBase {
  constructor(strategy, settings) {
    super(strategy, settings.accessKeyId);
    this.accessKeyId = settings.accessKeyId;
    this.secretAccessKey = settings.secretAccessKey;
    this.bucketName = settings.bucketName;
    this.fileName = settings.fileName;
    this.region = settings.region;
  }

  authentication() { // eslint-disable-line
    return false;
  }

  authenticated() {
    return !!this.accessKeyId;
  }

  getData() {
    AWS.config.update({ accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey, region: this.region });

    const s3 = new AWS.S3();

    const options = {
      Bucket: this.bucketName,
      Key: this.fileName,
    };

    return s3.getObject(options).createReadStream();
  }
}

class S3Strategy {
  getName() { // eslint-disable-line class-methods-use-this
    return 'S3';
  }

  newConnector(params) {
    return new S3(this, params);
  }
}

module.exports = S3Strategy;
