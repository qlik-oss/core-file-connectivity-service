const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

async function run() {
  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'Dropbox',
      params: { filePath: '/airports.csv' },
    })
    .expect(200);

  console.log('add connection done');

  await request(url).get(res.text).expect(401);

  console.log(`Authentication is needed for Dropbox, please visit in your browser: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authRes = await request(url).get(res.text);
    if (authRes.statusCode === 200) {
      clearInterval(interval);
      console.log(authRes.body.toString());
    }
  }, 1000);
}

run();
