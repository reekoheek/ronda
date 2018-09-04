const MemoryStorage = require('./storages/memory');

class Manager {
  constructor ({ storage = new MemoryStorage() } = {}) {
    this.metrics = [];
    this.storage = storage;
  }

  getStore (metric, label) {
    return this.storage.getStore(metric, label);
  }

  getLabels (metric) {
    return this.storage.getLabels(metric);
  }

  addMetric (metric) {
    // TODO: throw error if metric with name already available
    this.metrics.push(metric);
  }

  removeMetric (metric) {
    let index = this.metrics.indexOf(metric);
    if (index !== -1) {
      this.metrics.splice(index, 1);
    }
  }

  async query (qString, { interval = 0, from, to } = {}) {
    let matches = qString.match(/^([a-zA-Z0-9_]+::[a-zA-Z0-9_.-]+)(\{(.+)\})*$/);
    if (!matches) {
      throw new Error('Invalid query');
    }

    let name = matches[1];

    let metric = this.getMetric(name);
    if (!metric) {
      throw new Error('Metric not found');
    }

    let labels = [];
    if (matches[3]) {
      labels = matches[3].split(',').map(label => label.trim());
    }

    if (labels.length === 0) {
      labels = this.getLabels(metric);
    }

    let series = [];

    await Promise.all(labels.map(async label => {
      let entries = await metric.getEntries({ label, from, to, interval });
      series.push({ label, entries });
    }));

    return series;
  }

  getMetric (name) {
    return this.metrics.find(metric => metric.name === name);
  }

  async start () {
    await Promise.all(this.metrics.map(metric => metric.up(this)));
  }

  async stop () {
    await Promise.all(this.metrics.map(metric => metric.down()));
  }
}

module.exports = { Manager };
