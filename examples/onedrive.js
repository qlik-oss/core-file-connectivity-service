const Outhaul = require('../src/outhaul.js');
const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

const OneDriveProvider = require('../src/providers/onedrive/onedrive.js');
const logger = require('../src/logger').get();

async function run() {
  const providers = [
    new OneDriveProvider(),
  ];

  const outhaul = Outhaul({
    port: 3000,
    providers,
  });

  outhaul.start();

  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'OneDrive',
      params: { fileName: '/airports.csv' },
    })
    .expect(200);

  logger.info('add connection done');

  await request(url).get(res.text).expect(401);

  logger.info(`Authentication is needed for onedrive goto: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authResOnedrive = await request(url).get(res.text);

    if (authResOnedrive.statusCode === 200) {
      clearInterval(interval);
      logger.info(JSON.stringify(authResOnedrive));
    }
  }, 1000);
}

run();
