const { Metric } = require('../metric');
const debug = require('debug')('ronda:metrics:host');
const os = require('os');
const diskspace = require('diskspace');

class Host extends Metric {
  constructor ({ kind, instance = os.hostname(), interval = 5000 } = {}) {
    super({ kind, instance });
    this.running = false;
  }

  async _up () {
    debug('Starting host %s ...', this.instance);
    this.running = true;

    await this.fetch();
  }

  _down () {
    debug('Stopping host %s ...', this.instance);
    this.running = false;
    clearTimeout(this.timeout);
  }

  async fetch () {
    let now = new Date().getTime();
    let tasks = [];

    tasks.push(this.put(`uptime`, now, os.uptime()));
    tasks.push(this.put(`totalmem`, now, os.totalmem()));
    tasks.push(this.put(`freemem`, now, os.freemem()));

    os.loadavg().forEach((lav, index) => tasks.push(this.put(`loadavg${index}`, now, lav)));

    os.cpus().forEach((cpu, index) => {
      ['user', 'nice', 'sys', 'idle', 'irq'].forEach(key => {
        tasks.push(this.put(`cpu${index}_${key}`, now, cpu.times[key]));
      });
    });

    await new Promise((resolve, reject) => {
      diskspace.check('/', (err, result) => {
        if (err) {
          return reject(err);
        }

        tasks.push(this.put(`disk_total`, now, result.total));
        tasks.push(this.put(`disk_used`, now, result.used));
        tasks.push(this.put(`disk_free`, now, result.free));
      });
    });

    await Promise.all(tasks);

    if (this.running) {
      setTimeout(() => this.fetch(), 5000);
    }
  }
}

module.exports = Host;
