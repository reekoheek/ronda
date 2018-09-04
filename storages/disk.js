const levelup = require('levelup');
const leveldown = require('leveldown');
const path = require('path');
const fs = require('fs');
const mkdirp = require('../helpers/mkdirp');

class DiskStorage {
  constructor (base) {
    this.base = base;
    this.stores = {};
  }

  getStore ({ kind, instance }, label) {
    let dir = path.join(this.base, kind, instance, label);
    mkdirp(path.dirname(dir));

    if (!this.stores[dir]) {
      this.stores[dir] = levelup(leveldown(dir));
    }

    return this.stores[dir];
  }

  getLabels ({ kind, instance }) {
    let dir = path.join(this.base, kind, instance);
    let labels = fs.readdirSync(dir);
    return labels;
  }
}

module.exports = DiskStorage;
