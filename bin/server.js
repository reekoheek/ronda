const http = require('http');
const { Manager } = require('..');
const Bundle = require('bono');
const Ping = require('../metrics/ping');
const MetricBundle = require('../bundles/metric');
const GrafanaBundle = require('../bundles/grafana');
const path = require('path');
const DiskStorage = require('../storages/disk');

const PORT = process.env.PORT || 4000;

let storage = new DiskStorage(path.join(process.cwd(), 'stores'));
let manager = new Manager({ storage });

(async () => {
  await manager.addMetric(new Ping({ instance: 'goo.gl' }));
  await manager.addMetric(new Ping({ instance: 'detik.com' }));

  // manager.addMetric(new WebPage({ name: 'page-sagara.id' }));

  await manager.start();

  let bundle = new Bundle();

  bundle.use(require('bono/middlewares/logger')());
  bundle.use(require('bono/middlewares/json')());

  bundle.get('/', ctx => {
    let pkg = require('../package.json');
    return {
      name: pkg.name,
      version: pkg.version,
    };
  });

  bundle.bundle('/metric', new MetricBundle({ manager }));
  bundle.bundle('/grafana', new GrafanaBundle({ manager }));

  let server = http.createServer(bundle.callback());
  server.listen(PORT);
})();
