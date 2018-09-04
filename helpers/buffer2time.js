module.exports = function buffer2time (buf) {
  return parseInt(buf.toString('hex'), 16);
};
