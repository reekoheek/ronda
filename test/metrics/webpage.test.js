const Webpage = require('../../metrics/webpage');
const { Manager } = require('../..');

describe('Webpage', () => {
  it('put new request every interval', async () => {
    let metric = new Webpage({ url: 'http://sagara.id/p/homepage' });
    let manager = new Manager();

    try {
      await manager.addMetric(metric);

      await manager.start();
      await new Promise(resolve => {
        manager.getStore(metric, 'status').on('put', resolve);
      });
    } finally {
      await manager.stop();
    }
  });
});
