const Outhaul = require('./outhaul');
const fs = require('fs');
const path = require('path');

const logger = require('./logger').get();

const providers = [];

// TODO: Make strategies path configurable with environment variable to enable the container to mount a volume of strategies

const providersFolderPath = path.resolve(__dirname, 'providers');

logger.info(`Providers path ${providersFolderPath}`);

fs.readdirSync(providersFolderPath).forEach((file) => {
  const fullProviderPath = path.join(providersFolderPath, file, file);
  logger.info(`Using strategy ${fullProviderPath}`);
  const Provider = require(fullProviderPath)// eslint-disable-line
  providers.push(new Provider());
});

const outhaul = Outhaul({ port: 3000, providers });

outhaul.start();

logger.info('Outhaul started');
