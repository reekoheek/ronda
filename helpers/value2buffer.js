module.exports = function value2buffer (value) {
  let buf = Buffer.alloc(8);
  buf.writeDoubleBE(value);
  return buf;
};
