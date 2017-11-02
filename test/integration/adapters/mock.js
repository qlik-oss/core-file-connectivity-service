class Mock {
    constructor(params) {
        this.params = params;
    }

    getData() {
        return this.params;
    }
}

module.exports = Mock;