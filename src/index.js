const Outhaul = require('./outhaul');
const fs = require('fs');
const path = require('path');

const logger = require('./logger').get();

const strategies = [];

// TODO: Make strategies path configurable with environment variable to enable the container to mount a volume of strategies

const strategiesFolderPath = path.resolve(__dirname, '../strategies');

logger.info(`Strategies path ${strategiesFolderPath}`);

fs.readdirSync(strategiesFolderPath).forEach((file) => {
  const fullStrategiesPath = path.join(strategiesFolderPath, file, file);
  logger.info(`Using strategy ${fullStrategiesPath}`);
  strategies[file] = require(fullStrategiesPath); // eslint-disable-line
});

const outhaul = Outhaul({ port: 3000, strategies });

outhaul.start();
