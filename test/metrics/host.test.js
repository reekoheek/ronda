const Host = require('../../metrics/host');
const { Manager } = require('../..');
const assert = require('assert');
const os = require('os');

describe('Host', () => {
  let manager;

  afterEach(() => {
    manager.stop();
  });

  it('put new read every interval', async () => {
    let metric = new Host();
    manager = new Manager();

    try {
      await manager.addMetric(metric);

      await manager.start();

      await new Promise(resolve => setTimeout(resolve, 1000));

      await Promise.all(os.cpus().map(async (cpu, index) => {
        await Promise.all(['nice', 'sys', 'idle', 'irq'].map(async key => {
          assert.strictEqual((await metric.getEntries({ label: `cpu0_${key}` })).length, 1);
        }));
      }));

      assert.strictEqual((await metric.getEntries({ label: `uptime` })).length, 1);
      assert.strictEqual((await metric.getEntries({ label: `totalmem` })).length, 1);
      assert.strictEqual((await metric.getEntries({ label: `freemem` })).length, 1);
      assert.strictEqual((await metric.getEntries({ label: `loadavg0` })).length, 1);
      assert.strictEqual((await metric.getEntries({ label: `loadavg1` })).length, 1);
      assert.strictEqual((await metric.getEntries({ label: `loadavg2` })).length, 1);
    } finally {
      await manager.stop();
    }
  }).timeout(10000);
});
