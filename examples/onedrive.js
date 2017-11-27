const Outhaul = require('../src/outhaul.js');
const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

const OneDriveStrategy = require('../src/strategies/onedrive/onedrive.js');
const logger = require('../src/logger').get();

async function run() {
  const OneDrive = new OneDriveStrategy('59dac417-3a16-4829-beb6-024d7a649047', 'jiTGLVZ2*&lboywOB9615!]');

  const strategies = [
    OneDrive,
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const res = await request(url).post('/connections/')
    .send({
      connector: 'OneDrive',
      params: ['/airports.csv'],
    })
    .expect(200);

  logger.debug('add connection done');

  await request(url).get(res.text).expect(401);

  logger.info(`Authentication is needed for onedrive goto: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authResOnedrive = await request(url).get(res.text);

    if (authResOnedrive.statusCode === 200) {
      clearInterval(interval);
      logger.debug(authResOnedrive.body.toString());
    }
  }, 1000);
}

run();
