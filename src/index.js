const fs = require('fs');
const path = require('path');
const Configuration = require('./configuration');
const logger = require('./logger').get();
const Outhaul = require('./outhaul');

const configArg = process.argv.filter(arg => arg.startsWith('--config=')).pop() || '';
const configFile = configArg.replace('--config=', '');

if (!fs.existsSync(configFile)) {
  console.log(`Usage: node ${__filename} --config=<config file>`); // eslint-disable-line no-console
  process.exit(1);
}

const instances = [];
const config = new Configuration(configFile);

const port = config.get('port', 3000);

const strategies = config.get('strategies');
strategies.forEach((strategy) => {
  let strategyFile = strategy.path;
  const { options } = strategy;
  if (!fs.existsSync(strategyFile)) {
    strategyFile = path.join(__dirname, 'strategies', strategyFile);
  }
  try {
    const strategyImpl = require(strategyFile); // eslint-disable-line
    const instance = new strategyImpl(options); // eslint-disable-line new-cap
    logger.info(`Successfully instantiated ${strategyFile}`);
    instances.push(instance);
  } catch (error) {
    logger.warn(`Unable to instantiate ${strategyFile}`);
  }
});

const outhaul = Outhaul({ port, strategies: instances });
outhaul.start();

logger.info('Outhaul started');
