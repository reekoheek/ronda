const Bundle = require('bono');

class MetricBundle extends Bundle {
  constructor ({ manager }) {
    super();

    this.manager = manager;

    this.get('/', this.index.bind(this));
    this.get('/{name}', this.read.bind(this));
    this.get('/{name}/entries', this.entries.bind(this));
  }

  index (ctx) {
    return this.manager.metrics.map(metric => {
      return {
        type: metric.constructor.name,
        name: metric.name,
      };
    });
  }

  read (ctx) {
    let name = ctx.parameters.name;

    let metric = this.manager.metrics.find(metric => metric.name === name);
    if (!metric) {
      ctx.throw(404);
    }

    return {
      type: metric.constructor.name,
      name: metric.name,
    };
  }

  async entries (ctx) {
    let name = ctx.parameters.name;

    let metric = this.manager.metrics.find(metric => metric.name === name);
    if (!metric) {
      ctx.throw(404);
    }

    let entries = await metric.getEntries();
    return entries;
  }
}

module.exports = MetricBundle;
