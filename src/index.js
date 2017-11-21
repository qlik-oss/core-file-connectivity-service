const Outhaul = require('./outhaul');
const fs = require('fs');
const path = require('path');

const strategies = [];

// TODO: Make strategies path configurable with environment variable to enable the container to mount a volume of strategies

const strategiesFolderPath = path.resolve(__dirname, '../strategies');

console.log(`Adapters path ${strategiesFolderPath}`);

fs.readdirSync(strategiesFolderPath).forEach((file) => {
  const fullStrategyPath = path.join(strategiesFolderPath, file, file);
  console.log(`Using strategy ${fullStrategyPath}`);
  strategies.push(require(fullStrategyPath)); // eslint-disable-line
});

const outhaul = Outhaul({ port: 3000, strategies });

outhaul.start();

console.log("Outhaul started");
