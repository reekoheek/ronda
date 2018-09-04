const { Metric } = require('../metric');
const assert = require('assert');
const buffer2time = require('../helpers/buffer2time');
const buffer2value = require('../helpers/buffer2value');

describe('Metric', () => {
  describe('#getStore()', () => {
    it('return store', () => {
      let storeMock = {};
      let metric = new Metric({ instance: 'foo' });
      metric.manager = {
        getStore () {
          return storeMock;
        },
      };
      let store = metric.getStore('bar');
      assert.strictEqual(store, storeMock);
    });
  });

  describe('#put()', () => {
    it('put entry to store', async () => {
      let putInvoked = false;

      let storeMock = {
        put (t, v) {
          putInvoked = true;
          assert.strictEqual(buffer2time(t), time);
          assert.strictEqual(buffer2value(v), value);
        },
      };
      let metric = new Metric({ instance: 'foo' });
      metric.manager = {
        getStore () {
          return storeMock;
        },
      };

      let time = new Date().getTime();
      let value = 1;

      await metric.put('bar', time, value);

      assert(putInvoked);
    });
  });
});
