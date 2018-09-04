const { spawn } = require('child_process');
const { Metric } = require('../metric');
const debug = require('debug')('ronda:metrics:ping');

class Ping extends Metric {
  _up () {
    this.startRunner();
  }

  _down () {
    this.stopRunner();
  }

  get labels () {
    return [ 'time' ];
  }

  startRunner () {
    debug('Starting ping %s ...', this.instance);
    this.runner = spawn('ping', [ this.instance ]);
    this.runner.stdout.on('data', data => {
      let [ ms ] = data.toString().trim().split('time=').pop().split(' ');
      this.put('time', new Date().getTime(), ms);
    });

    this.runner.on('close', code => {
      debug('Closing ping %s with code %s...', this.instance, code);

      if (!code) {
        return;
      }

      setTimeout(() => this.startRunner(), 5000);
    });
  }

  stopRunner () {
    debug('Stopping ping %s ...', this.instance);
    this.runner.kill(9);
  }
}

module.exports = Ping;
