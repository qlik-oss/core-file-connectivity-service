const Outhaul = require('../src/outhaul.js');
const request = require('supertest');

const DropboxStrategy = require('../strategies/dropbox/dropbox.js');

async function run() {
  const Dropbox = new DropboxStrategy('xhf34uwq738crh5', '74vk4ym12bq205k');

  const strategies = [
    Dropbox,
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const res = await request(url).post('/connections/add')
    .send({
      connector: 'Dropbox',
      params: ['/airports.csv'],
    })
    .expect(200);

  console.log('add connection done');

  await request(url).get(res.text).expect(401);

  console.log(`Authentication is needed for onedrive goto: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authRes = await request(url).get(res.text);
    console.log(authRes.body);
    if (authRes.statusCode === 200) {
      clearInterval(interval);
      console.log(authRes.body.toString());
    }
  }, 1000);
}

run();
