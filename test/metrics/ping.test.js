const Ping = require('../../metrics/ping');
const { Manager } = require('../..');

describe('Ping', () => {
  it('put new ping every second', async () => {
    let metric = new Ping({ instance: 'localhost' });
    let manager = new Manager();

    try {
      await manager.addMetric(metric);

      await manager.start();

      await new Promise(resolve => setTimeout(resolve, 1000));

      await new Promise(resolve => {
        manager.getStore(metric, 'time').createReadStream().on('data', resolve);
      });
    } finally {
      await manager.stop();
    }
  });
});
