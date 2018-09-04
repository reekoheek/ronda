const { Manager } = require('../manager');
const { Metric } = require('../metric');
const assert = require('assert');

describe('Manager', () => {
  describe('constructor', () => {
    it('has empty metrics', () => {
      let manager = new Manager();

      assert.strictEqual(manager.metrics.length, 0);
    });
  });

  describe('#getStore()', () => {
    it('return store', () => {
      let manager = new Manager();

      let metric = {
        kind: 'Foo',
        instance: 'bar',
      };

      let store = manager.getStore(metric, 'baz');
      assert.strictEqual(typeof store.put, 'function');
      assert.strictEqual(typeof store.createReadStream, 'function');
    });
  });

  describe('#query()', () => {
    it.only('return multiple datapoints', async () => {
      let manager = new Manager();

      let metric = new Metric({ kind: 'Foo', instance: 'bar' });

      manager.addMetric(metric);

      try {
        await manager.start();

        let now = new Date().getTime();
        await metric.put('1', now, 1);
        await metric.put('2', now, 2);
        await metric.put('3', now, 3);

        let result = await manager.query('Foo::bar');
        assert.strictEqual(result.length, 3);
        result = await manager.query('Foo::bar{1,2}');
        assert.strictEqual(result.length, 2);
      } finally {
        await manager.stop();
      }
    });
  });

  it('add new metric and get then remove', async () => {
    let manager = new Manager();
    assert.strictEqual(manager.metrics.length, 0);

    let metric = new Metric({ kind: 'Foo', instance: 'bar' });

    await manager.addMetric(metric);

    assert.strictEqual(manager.metrics.length, 1);

    assert.strictEqual(manager.getMetric('Foo::bar'), metric);

    await manager.removeMetric(metric);

    assert.strictEqual(manager.metrics.length, 0);
  });
});
