const ConsumableStream = require('consumable-stream');
const Consumer = require('./consumer');

class WritableConsumableStream extends ConsumableStream {
  constructor(options) {
    super();
    options = options || {};
    this._nextConsumerId = 1;
    this.generateConsumerId = options.generateConsumerId;
    if (!this.generateConsumerId) {
      this.generateConsumerId = () => this._nextConsumerId++;
    }
    this.removeConsumerCallback = options.removeConsumerCallback;
    this._consumers = new Map();

    // Tail node of a singly linked list.
    this.tailNode = {
      next: null,
      data: {
        value: undefined,
        done: false
      }
    };
  }

  _write(value, done, consumerId) {
    let dataNode = {
      data: {value, done},
      next: null
    };
    if (consumerId) {
      dataNode.consumerId = consumerId;
    }
    this.tailNode.next = dataNode;
    this.tailNode = dataNode;

    for (let consumer of this._consumers.values()) {
      consumer.write(dataNode.data);
    }
  }

  write(value) {
    this._write(value, false);
  }

  close(value) {
    this._write(value, true);
  }

  writeToConsumer(consumerId, value) {
    this._write(value, false, consumerId);
  }

  closeConsumer(consumerId, value) {
    this._write(value, true, consumerId);
  }

  kill(value) {
    for (let consumerId of this._consumers.keys()) {
      this.killConsumer(consumerId, value);
    }
  }

  killConsumer(consumerId, value) {
    let consumer = this._consumers.get(consumerId);
    if (!consumer) {
      return;
    }
    consumer.kill(value);
  }

  getBackpressure() {
    let maxBackpressure = 0;
    for (let consumer of this._consumers.values()) {
      let backpressure = consumer.getBackpressure();
      if (backpressure > maxBackpressure) {
        maxBackpressure = backpressure;
      }
    }
    return maxBackpressure;
  }

  getConsumerBackpressure(consumerId) {
    let consumer = this._consumers.get(consumerId);
    if (consumer) {
      return consumer.getBackpressure();
    }
    return 0;
  }

  hasConsumer(consumerId) {
    return this._consumers.has(consumerId);
  }

  setConsumer(consumerId, consumer) {
    this._consumers.set(consumerId, consumer);
    if (!consumer.currentNode) {
      consumer.currentNode = this.tailNode;
    }
  }

  removeConsumer(consumerId) {
    let result = this._consumers.delete(consumerId);
    if (this.removeConsumerCallback) this.removeConsumerCallback(consumerId);
    return result;
  }

  getConsumerStats(consumerId) {
    let consumer = this._consumers.get(consumerId);
    if (consumer) {
      return consumer.getStats();
    }
    return undefined;
  }

  getConsumerStatsList() {
    let consumerStats = [];
    for (let consumer of this._consumers.values()) {
      consumerStats.push(consumer.getStats());
    }
    return consumerStats;
  }

  createConsumer(timeout) {
    return new Consumer(this, this.generateConsumerId(), this.tailNode, timeout);
  }

  getConsumerList() {
    return [...this._consumers.values()];
  }

  getConsumerCount() {
    return this._consumers.size;
  }
}

module.exports = WritableConsumableStream;
