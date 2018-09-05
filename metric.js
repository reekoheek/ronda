const time2buffer = require('./helpers/time2buffer');
const value2buffer = require('./helpers/value2buffer');
const buffer2time = require('./helpers/buffer2time');
const buffer2value = require('./helpers/buffer2value');
const debug = require('debug')('ronda:metric');

class Metric {
  constructor ({ kind, instance }) {
    if (!instance) {
      throw new Error('Instance must be specified');
    }

    this.kind = kind || this.constructor.name;
    this.instance = instance;
  }

  get name () {
    return `${this.kind}::${this.instance}`;
  }

  async up (manager) {
    this.manager = manager;
    await this._up();
    debug('%s up', this.name);
  }

  async down () {
    await this._down();
    this.manager = undefined;
    debug('%s down', this.name);
  }

  getStore (label) {
    return this.manager.getStore(this, label);
  }

  async put (label, time, value) {
    await this.getStore(label).put(time2buffer(time), value2buffer(value));
  }

  getEntries ({ label, from, to, interval = 0 } = {}) {
    let options = from || to ? {} : undefined;

    if (from) {
      options.gte = time2buffer(from);
    }

    if (to) {
      options.lte = time2buffer(to);
    }

    return new Promise((resolve, reject) => {
      let stream = this.getStore(label).createReadStream(options);
      let entries = [];
      let lastT = 0;
      let groupEntries = [];

      function putEntry () {
        if (!groupEntries.length) {
          return;
        }

        let vSum = 0;
        let tSum = 0;
        groupEntries.forEach(({ t, v }) => {
          vSum += v;
          tSum += t;
        });

        entries.push({
          t: tSum / groupEntries.length,
          v: vSum / groupEntries.length,
        });

        groupEntries = [];
      }

      stream.on('data', ({ key, value }) => {
        let t = buffer2time(key);
        let v = buffer2value(value);

        if (t > lastT + interval) {
          putEntry();

          lastT = t;
        }

        groupEntries.push({ t, v });
      });

      stream.on('end', () => {
        putEntry();
        resolve(entries);
      });
    });
  }

  _up () {
    // noop
  }

  _down () {
    // noop
  }
}

module.exports = { Metric };
