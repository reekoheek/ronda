const { sprintf } = require('sprintf-js');

module.exports = function time2buffer (time) {
  return Buffer.from(sprintf('%016s', time.toString(16)), 'hex');
};
