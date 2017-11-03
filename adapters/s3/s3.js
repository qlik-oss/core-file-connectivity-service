const AWS = require('aws-sdk');

class S3 {
  constructor(accessKeyId, secretAccessKey, bucket, file, region) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucket = bucket;
    this.file = file;
    this.region = region || 'eu-west-2';
  }

  getData() {
    return S3.getData(this.accessKeyId, this.secretAccessKey, this.bucket, this.file, this.region);
  }
}

function getData(accessKeyId, secretAccessKey, bucket, file, region) {
  AWS.config.update({ accessKeyId, secretAccessKey, region: region || 'eu-west-2' });

  const s3 = new AWS.S3();

  const options = {
    Bucket: bucket,
    Key: file,
  };

  return s3.getObject(options).createReadStream();
}

S3.getData = getData;

module.exports = S3;
