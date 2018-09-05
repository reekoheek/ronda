const Bundle = require('bono');
// const debug = require('debug')('ronda:bundles:grafana');

class GrafanaBundle extends Bundle {
  constructor ({ manager }) {
    super();

    this.manager = manager;

    this.get('/', this.rIndex.bind(this));
    this.post('/search', this.rSearch.bind(this));
    this.post('/query', this.rQuery.bind(this));
    this.get('/annotations', this.rAnnotations.bind(this));
  }

  rIndex (ctx) {
    let pkg = require('../package.json');
    return {
      name: pkg.name + ' (grafana)',
      version: pkg.version,
    };
  }

  rSearch (ctx) {
    return this.manager.metrics.map(metric => metric.name);
  }

  async rQuery (ctx) {
    let body = await ctx.parse();

    let targets = [];

    // debug(body);
    let interval = body.intervalMs;
    let from = new Date(body.range.from).getTime();
    let to = new Date(body.range.to).getTime();

    await Promise.all(body.targets.map(async ({ target, type }) => {
      try {
        let series = await this.manager.query(target, { interval, from, to });
        series.forEach(({ name, label, entries }) => {
          targets.push({
            target: `${name}{${label}}`,
            datapoints: entries.map(({ v, t }) => [ v, t ]),
          });
        });
      } catch (err) {
        console.error('xx', err);
      }
    }));

    return targets;
  }

  rAnnotations (ctx) {
    throw new Error('Unimplemented yet');
  }
}

module.exports = GrafanaBundle;
