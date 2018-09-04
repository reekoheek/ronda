const Webpage = require('../../metrics/webpage');
const { Manager } = require('../..');

describe('Webpage', () => {
  it('put new request every interval', async () => {
    let metric = new Webpage({ url: 'http://sagara.id/p/homepage' });
    let manager = new Manager();

    try {
      await manager.addMetric(metric);

      await manager.start();

      await new Promise(resolve => setTimeout(resolve, 1000));

      await new Promise(resolve => {
        let stream = manager.getStore(metric, 'status').createReadStream();
        stream.on('data', resolve);
      });
    } finally {
      await manager.stop();
    }
  }).timeout(10000);
});
