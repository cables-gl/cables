const ConsumableStream = require('consumable-stream');

class DemuxedConsumableStream extends ConsumableStream {
  constructor(streamDemux, name) {
    super();
    this._streamDemux = streamDemux;
    this.name = name;
  }

  createConsumer(timeout) {
    return this._streamDemux.createConsumer(this.name, timeout);
  }
}

module.exports = DemuxedConsumableStream;
