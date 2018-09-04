const fs = require('fs');

module.exports = function exists (p) {
  try {
    return Boolean(fs.statSync(p));
  } catch (err) {
    if (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }

      return false;
    }
  }
};
