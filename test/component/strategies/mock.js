class Mock {
  constructor(params) {
    this.params = params;
    this.name = 'Mock';
    this.uuid = '1234';
  }
  getName() {
    return this.name;
  }

  newConnector() {
    return {
      uuid: () => this.uuid,
      getData: () => this.params,
    };
  }
}

module.exports = Mock;
