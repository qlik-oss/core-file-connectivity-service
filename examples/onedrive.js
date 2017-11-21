const Outhaul = require('../src/outhaul.js');
const request = require('supertest');

const GoogleDriveStrategy = require('../strategies/googledrive/googledrive.js');
const OneDriveStrategy = require('../strategies/onedrive/onedrive.js');

async function run() {
  const GoogleDrive = new GoogleDriveStrategy('811557351071-2q71bjutd6fnppg24ps5nposmk42e97t.apps.googleusercontent.com', 'yi4C3WagMm4J2Ig2Vr4xYbSZ');
  const OneDrive = new OneDriveStrategy('59dac417-3a16-4829-beb6-024d7a649047', 'jiTGLVZ2*&lboywOB9615!]');

  const strategies = [
    GoogleDrive,
    OneDrive,
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const res2 = await request(url).post('/connections/add')
    .send({
      connector: 'OneDrive',
      params: ['/airports.csv'],
    })
    .expect(200);

  console.log('add connection done');

  await request(url).get(res2.text).expect(401);

  console.log(`Authentication is needed for onedrive goto: ${url}${res2.text}/authentication`);

  const interval = setInterval(async () => {
    const authResOnedrive = await request(url).get(res2.text);

    if (authResOnedrive.statusCode === 200) {
      clearInterval(interval);
      console.log(authResOnedrive.body.toString());
    }
  }, 1000);
}

run();
