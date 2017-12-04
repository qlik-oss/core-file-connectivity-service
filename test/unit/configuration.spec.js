const path = require('path');
const Configuration = require('../../src/configuration');

const simpleConfig = path.join(__dirname, 'data', 'simple.json');
const complexConfig = path.join(__dirname, 'data', 'complex.json');
const envConfig = path.join(__dirname, 'data', 'env.json');

describe('Configuration', () => {
  it('constructor with valid config file', () => {
    const config = new Configuration(simpleConfig);
    expect(config).to.not.equal(undefined);
  });

  it('constructor with missing config file', () => {
    expect(() => new Configuration('/no/such/file')).to.throw();
  });

  describe('get()', () => {
    it('simple value', () => {
      const config = new Configuration(simpleConfig);
      expect(config.get('key1')).to.equal('value1');
    });

    it('complex structure', () => {
      const config = new Configuration(complexConfig);
      const expectation = {
        key: 'value',
        sub: {
          structure: {
            keys: ['value1', 'value2'],
          },
        },
      };
      expect(config.get('complex.structure')).to.deep.equal(expectation);
      expect(config.get('complex.structure.sub.structure.keys')).to.deep.equal(expectation.sub.structure.keys);
    });

    it('should incorporate environment variables', () => {
      process.env.OUTHAUL_TEST_ENV = 'resolved value';
      const config = new Configuration(envConfig);
      expect(config.get('structure.with.environment.reference')).to.equal('resolved value');
    });

    it('should return default value', () => {
      const config = new Configuration(complexConfig);
      const value = config.get('complex.structure.non.existing.key', 'default value');
      expect(value).to.equal('default value');
    });
  });
});
