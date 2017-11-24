const Outhaul = require('../src/outhaul.js');
const request = require('supertest');

const S3Strategy = require('../strategies/s3/s3.js');
const logger = require('../src/logger').get();

async function run() {
  const S3 = new S3Strategy();

  const strategies = [
    S3,
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const accessKeyId = 'AKIAJDU35PC5CZM2IWCQ';
  const secretAccessKey = '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';
  const bucketName = 'stefanenberg';
  const fileName = 'airports.csv';
  const region = 'eu-west-2';

  const res = await request(url).post('/connections/add')
    .send({
      connector: 'S3',
      params: [accessKeyId, secretAccessKey, bucketName, fileName, region],
    })
    .expect(200);

  logger.info('add connection done');

  await request(url).get(res.text).expect(401);

  logger.info(`Authentication is needed for onedrive goto: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authRes = await request(url).get(res.text);
    if (authRes.statusCode === 200) {
      clearInterval(interval);
      logger.info(authRes.body.toString());
    }
  }, 1000);
}

run();
