const AWS = require('aws-sdk');
const ConnectionBase = require('../../connection-base');

class S3 extends ConnectionBase {
  constructor(strategy, accessKeyId, secretAccessKey, bucket, file, region) {
    super(strategy, accessKeyId);
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucket = bucket;
    this.file = file;
    this.region = region;
  }

  authentication() { // eslint-disable-line
    return false;
  }

  getData() {
    AWS.config.update({ accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey, region: this.region });

    const s3 = new AWS.S3();

    const options = {
      Bucket: this.bucket,
      Key: this.file,
    };

    return s3.getObject(options).createReadStream();
  }
}

class S3Strategy {
  getName() { // eslint-disable-line
    return 'S3';
  }

  newConnector(params) {
    return new S3(this, ...params);
  }
}

module.exports = S3Strategy;
