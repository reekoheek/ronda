const superagent = require('superagent');
const { Metric } = require('../metric');
const debug = require('debug')('ronda:metrics:webpage');

class Webpage extends Metric {
  constructor ({ kind, url, interval = 5000 }) {
    super({ kind, instance: url.replace(/[\/\\:]+/g, '-') });

    this.url = url;
    this.interval = interval;
  }

  _up () {
    debug('Starting request %s ...', this.url);

    this.running = true;
    this.doRequest();
  }

  _down () {
    debug('Stopping request %s ...', this.url);

    this.running = false;
    this.req.abort();
    clearTimeout(this.timeout);
  }

  async doRequest () {
    let startT = new Date().getTime();
    try {
      this.req = superagent(this.url);
      let res = await this.req;
      if (!this.running) {
        return;
      }

      let now = new Date().getTime();
      let responseTime = now - startT;

      this.put('responseTime', now, responseTime);
      this.put('status', now, res.status);
    } catch (err) {
      let now = new Date().getTime();
      let responseTime = now - startT;

      this.put('responseTime', now, responseTime);
      this.put('status', now, 0);
    }

    this.timeout = setTimeout(() => this.doRequest(), this.interval);
  }
}

module.exports = Webpage;
