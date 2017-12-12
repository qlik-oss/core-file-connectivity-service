const Outhaul = require('../src/outhaul.js');
const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

const DropboxProvider = require('../src/providers/dropbox/dropbox.js');
const logger = require('../src/logger').get();

async function run() {
  const providers = [
    new DropboxProvider(),
  ];

  const outhaul = Outhaul({
    port: 3000,
    providers,
  });

  outhaul.start();

  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'Dropbox',
      params: { filePath: '/airports.csv' },
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
