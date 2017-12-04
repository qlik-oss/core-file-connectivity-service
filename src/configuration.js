const fs = require('fs');

const { hasOwnProperty } = Object.prototype;

const ENV_KEY = 'env';

function recursiveGet(object, props, defaultValue) {
  const property = props[0];
  const value = object[property];

  if (!value) {
    return defaultValue;
  } else if (props.length === 1) {
    return value;
  }

  return recursiveGet(value, props.slice(1), defaultValue);
}

class Configuration {
  constructor(file) {
    const contents = fs.readFileSync(file, { encoding: 'UTF8' });
    this.config = JSON.parse(contents, (key, value) =>
      (typeof value === 'object' && hasOwnProperty.call(value, ENV_KEY) ?
        process.env[value[ENV_KEY]] : value));
  }

  get(property, defaultValue) {
    return recursiveGet(this.config, property.split('.'), defaultValue);
  }
}

module.exports = Configuration;
