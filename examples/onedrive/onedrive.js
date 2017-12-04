const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

async function run() {
  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'OneDrive',
      params: { fileName: '/airports.csv' },
    })
    .expect(200);

  console.log('add connection done');

  await request(url).get(res.text).expect(401);

  console.log(`Authentication is needed for onedrive goto: ${url}${res.text}/authentication`);

  const interval = setInterval(async () => {
    const authResOnedrive = await request(url).get(res.text);

    if (authResOnedrive.statusCode === 200) {
      clearInterval(interval);
      console.log(JSON.stringify(authResOnedrive));
    }
  }, 1000);
}

run();
