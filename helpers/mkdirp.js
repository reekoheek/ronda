const fs = require('fs');
const path = require('path');
const exists = require('./exists');

module.exports = function mkdirp (p) {
  p = path.resolve(p);

  let pExists = exists(p);
  if (pExists) {
    return;
  }

  mkdirp(path.dirname(p));

  try {
    fs.mkdirSync(p);
  } catch (err) {
    // noop
  }
};
