class Mock {
  constructor(params) {
    this.params = params;
    this.name = 'Mock';
    this.id = '1234';
  }

  getName() {
    return this.name;
  }

  newConnector() {
    return {
      id: this.id,
      uuid: () => this.id,
      getData: () => this.params,
    };
  }
}

module.exports = Mock;
