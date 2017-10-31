const Outhaul = require("./outhaul");
const fs = require("fs");
const path = require('path');

let adapters = {};

// TODO: Make adapters path configurable with environment variable to enable the container to mount a volume of adapters

const adapterFolderPath = path.resolve(__dirname, '../adapters');

console.log(`Adapters path ${adapterFolderPath}`);

fs.readdirSync(adapterFolderPath).forEach(file => {
    const fullAdapterPath = path.join(adapterFolderPath, file, file);
    console.log(`Using adapter ${fullAdapterPath}`);
    adapters[file] = require(fullAdapterPath);
});

let outhaul = Outhaul({ port: 3000, adapters: adapters });

outhaul.start();