const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const GoogleDrive = require('../../adapters/googledrive/googledrive.js');

async function run(){
  GoogleDrive.configure('811557351071-2q71bjutd6fnppg24ps5nposmk42e97t.apps.googleusercontent.com', 'yi4C3WagMm4J2Ig2Vr4xYbSZ');

  const strategies = [
    GoogleDrive

]
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
      params: ['airports.csv'],
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
