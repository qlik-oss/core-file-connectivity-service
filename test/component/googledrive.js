const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const GoogleDrive = require('../../adapters/googledrive/googledrive.js');

async function run(){
  const strategies = {
    GoogleDrive: GoogleDrive,
  };

  let outhaul;

  outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const res = await request(url).post('/connections/add')
    .send({
      adapter: 'GoogleDrive',
      params: [
        '811557351071-2q71bjutd6fnppg24ps5nposmk42e97t.apps.googleusercontent.com', //OAuth2 clientID
        'yi4C3WagMm4J2Ig2Vr4xYbSZ', //OAuth2 secret
        'airports.csv'], //File on google drive to download
    })
    .expect(200);

  await request(url).get(res.text).expect(401);

  console.log('Authentication is needed go to: ' + url + res.text + '/authentication');

  setTimeout(async function(){
    const finalRes = await request(url).get(res.text);

    console.log(finalRes.body.toString());

  }, 10000);
}

run();
