const request = require('superagent');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.67.2.json');
const enigma = require('enigma.js');
const open = require('open');

// Authentication helper function
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

(async () => {
  try {
    console.log('Adding Dropbox connection in file-connectivity-service to airports.csv file');
    const addConnectionResult = await request.post('http://localhost:3000/v1/connections/').send({
      connector: 'Dropbox',
      params: {
        filePath: '/airports.csv',
      },
    });

    const localhostAccessibleURL = `http://localhost:3000/v1${addConnectionResult.text}`;
    const dockerNetworkAccessibleURL = `http://file-connectivity-service:3000/v1${addConnectionResult.text}`;

    console.log('Initiating OAuth 2.0 authentication flow in file-connectivity-service');
    open(`${localhostAccessibleURL}/authentication`);
    await waitForAuthentication(localhostAccessibleURL);

    console.log('Creating and opening engine session');
    const session = enigma.create({
      schema,
      url: 'ws://localhost:19076',
      createSocket: url => new WebSocket(url),
    });

    const global = await session.open();
    const app = await global.createSessionApp();

    console.log('Creating engine web file connection');
    await app.createConnection({
      qName: 'data',
      qConnectionString: dockerNetworkAccessibleURL,
      qType: 'internet',
    });

    console.log('Executing engine load script');
    const loadScript = `Airports:
                          LOAD * FROM [lib://data]
                          (txt, header is 1 lines, embedded labels, utf8);`;
    await app.setScript(loadScript);
    await app.doReload();

    console.log('Printing the first 10 rows of the Airports table:');
    // Convert table grid into a string using some functional magic.
    const tableData = await app.getTableData(-1, 10, true, 'Airports');
    const tableDataAsString = tableData.map(row => row.qValue.map(value => value.qText).reduce((left, right) => `${left}\t${right}`)).reduce((row1, row2) => `${row1}\n${row2}`);
    console.log(tableDataAsString);

    console.log('Removing Dropbox connection from file-connectivity-service');
    await request.delete(localhostAccessibleURL);
    await session.close();
    console.log('Engine session closed');
  } catch (err) {
    console.log('Whoops! An error occurred', err);
    process.exit(1);
  }
})();
