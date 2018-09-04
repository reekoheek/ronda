module.exports = function buffer2value (buf) {
  return buf.readDoubleBE();
};
