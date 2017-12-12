const Outhaul = require('../src/outhaul.js');
const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

const S3Provider = require('../src/providers/s3/s3.js');
const logger = require('../src/logger').get();

async function run() {
  const providers = [
    new S3Provider(),
  ];

  const outhaul = Outhaul({
    port: 3000,
    providers,
  });

  outhaul.start();

  const url = 'http://localhost:3000/v1';

  const accessKeyId = 'xxx';
  const secretAccessKey = 'xxx';
  const bucketName = 'xxx';
  const fileName = 'airports.csv';
  const region = 'eu-west-2';

  const res = await request(url).post('/connections')
    .send({
      connector: 'S3',
      params: {
        accessKeyId, secretAccessKey, bucketName, fileName, region,
      },
    })
    .expect(200);

  const authRes = await request(url).get(res.text);

  logger.info(JSON.stringify(authRes.body.toString()));
}

run();
