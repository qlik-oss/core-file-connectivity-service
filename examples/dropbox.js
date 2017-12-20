const request = require('superagent');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');
const enigma = require('enigma.js');
const open = require('open');
const Halyard = require('halyard.js');
const enigmaMixin = require('halyard.js/dist/halyard-enigma-mixin.js');

const host = 'localhost';

// create a new session:
const session = enigma.create({
  schema,
  url: `ws://${host}:19076/app/engineData`,
  createSocket: url => new WebSocket(url),
  mixins: enigmaMixin,
});

async function waitForAuthentication(uri) {
  let resolve;
  let reject;

  const pullPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const pullFn = async () => {
    try {
      await request.get(uri);
      resolve();
    } catch (err) {
      if (err.status !== 401) {
        reject(err);
      } else {
        setTimeout(pullFn, 500);
      }
    }
  };

  setTimeout(pullFn, 0);

  return pullPromise;
}

async function e2e() {
  const addConnectionResult = await request.post('http://localhost:3000/v1/connections/').send({
    connector: 'Dropbox',
    params: {
      filePath: '/airports.csv',
    },
  });

  const localhostAccessibleURL = `http://localhost:3000/v1${addConnectionResult.text}`;

  // Initiate the OAuth 2.0 authentication flow
  open(`${localhostAccessibleURL}/authentication`);

  await waitForAuthentication(localhostAccessibleURL);

  const halyard = new Halyard();

  const dockerNetworkAccessibleURL = `http://file-connectivity-service:3000/v1${addConnectionResult.text}`;

  halyard.addTable(
    new Halyard.Connections.Web(dockerNetworkAccessibleURL, 'csv'),
    {
      name: 'Airports',
      characterSet: 'utf8',
      headerRowNr: 1,
    },
  );

  const global = await session.open();

  const appName = 'Airports';

  try {
    const app = await global.reloadAppUsingHalyard(appName, halyard, true);
    console.log(`App created and reloaded - ${appName}.qvf`);

    const tableData = await app.getTableData(-1, 10, true, 'Airports');

    // Convert table grid into a string using some functional magic
    const tableDataAsString = tableData.map(row => row.qValue.map(value => value.qText).reduce((left, right) => `${left}\t${right}`)).reduce((row1, row2) => `${row1}\n${row2}`);
    console.log('First 10 rows of Airports table:');
    console.log(tableDataAsString);

    // Removing data source endpoint from file-connectivity-service
    await request.delete(localhostAccessibleURL);

    await session.close();

    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

e2e();
