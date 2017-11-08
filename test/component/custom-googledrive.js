const Outhaul = require('../../src/outhaul.js');
const request = require('supertest');

const CustomGoogleDrive = require('../../adapters/custom-googledrive/custom-googledrive.js');

async function run(){
  const adapters = {
    customGoogleDrive: CustomGoogleDrive,
  };

  let outhaul;

  outhaul = Outhaul({
    port: 3000,
    adapters,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const res = await request(url).post('/connections/add')
    .send({
      adapter: 'customGoogleDrive',
      params: [
        '811557351071-2q71bjutd6fnppg24ps5nposmk42e97t.apps.googleusercontent.com',
        'yi4C3WagMm4J2Ig2Vr4xYbSZ',
        'http://localhost:3000/googledrive/authentication/callback',
        'airports.csv'],
    })
    .expect(200);

  await request(url).get(res.text).expect(401);

  console.log(url+res.text+'/authentication');

  setTimeout(async function(){

    const finalRes = await request(url).get(res.text);

    console.log(finalRes.body.toString());

  }, 10000);
}

run();
