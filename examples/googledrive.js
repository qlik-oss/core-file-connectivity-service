const Outhaul = require('../src/outhaul.js');
const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

const GoogleDriveStrategy = require('../src/strategies/googledrive/googledrive.js');
const logger = require('../src/logger').get();

async function run() {
  const strategies = [
    new GoogleDriveStrategy(),
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'GoogleDrive',
      params: { fileName: 'airports.csv' },
    })
    .expect(200);


  await request(url).get(res.text).expect(401);

  logger.info(`Authentication is needed for google drive goto: ${url}${res.text}/authentication`);


  const interval = setInterval(async () => {
    const authRes = await request(url).get(res.text);

    if (authRes.statusCode === 200) {
      clearInterval(interval);
      logger.info(authRes.body.toString());
    }
  }, 1000);
}

run();
