const levelup = require('levelup');
const memdown = require('memdown');

class MemoryStorage {
  constructor () {
    this.stores = {};
  }

  getStore ({ name }, label) {
    if (!this.stores[name]) {
      this.stores[name] = {};
    }

    if (!this.stores[name][label]) {
      this.stores[name][label] = levelup(memdown());
    }
    return this.stores[name][label];
  }

  getLabels ({ name }) {
    if (!this.stores[name]) {
      return [];
    }

    return Object.keys(this.stores[name]);
  }
}

module.exports = MemoryStorage;
