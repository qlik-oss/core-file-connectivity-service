const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

async function run() {
  const url = 'http://localhost:3000/v1';

  const accessKeyId = 'xxx';
  const secretAccessKey = 'xxx';
  const bucketName = 'xxx';
  const fileName = 'airports.csv';
  const region = 'eu-west-2';

  const res = await request(url).post('/connections')
    .send({
      connector: 'S3',
      params: {
        accessKeyId, secretAccessKey, bucketName, fileName, region,
      },
    })
    .expect(200);

  const authRes = await request(url).get(res.text);

  console.log(JSON.stringify(authRes.body.toString()));
}

run();
