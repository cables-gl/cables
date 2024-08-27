const assert = require('assert');
const AsyncStreamEmitter = require('../index');

let pendingTimeoutSet = new Set();

function wait(duration) {
  return new Promise((resolve) => {
    let timeout = setTimeout(() => {
      pendingTimeoutSet.clear(timeout);
      resolve();
    }, duration);
    pendingTimeoutSet.add(timeout);
  });
}

function cancelAllPendingWaits() {
  for (let timeout of pendingTimeoutSet) {
    clearTimeout(timeout);
  }
}

describe('AsyncStreamEmitter', () => {
  let streamEmitter;

  beforeEach(async () => {
    streamEmitter = new AsyncStreamEmitter();
  });

  afterEach(async () => {
    cancelAllPendingWaits();
  });

  it('should expose an emit method', async () => {
    assert.equal(!!streamEmitter.emit, true);
  });

  it('should expose a listener method', async () => {
    assert.equal(!!streamEmitter.listener, true);
  });

  it('should expose a closeListener method', async () => {
    assert.equal(!!streamEmitter.closeListener, true);
  });

  it('should expose a closeAllListeners method', async () => {
    assert.equal(!!streamEmitter.closeAllListeners, true);
  });

  it('should expose a getListenerConsumerStats method', async () => {
    assert.equal(!!streamEmitter.getListenerConsumerStats, true);
  });

  it('should expose a getListenerConsumerStats method', async () => {
    assert.equal(!!streamEmitter.getListenerConsumerStatsList, true);
  });

  it('should expose a getAllListenersConsumerStatsList method', async () => {
    assert.equal(!!streamEmitter.getAllListenersConsumerStatsList, true);
  });

  it('should expose a killListener method', async () => {
    assert.equal(!!streamEmitter.killListener, true);
  });

  it('should expose a killAllListeners method', async () => {
    assert.equal(!!streamEmitter.killAllListeners, true);
  });

  it('should expose a killListenerConsumer method', async () => {
    assert.equal(!!streamEmitter.killListenerConsumer, true);
  });

  it('should expose a getListenerBackpressure method', async () => {
    assert.equal(!!streamEmitter.getListenerBackpressure, true);
  });

  it('should expose a getAllListenersBackpressure method', async () => {
    assert.equal(!!streamEmitter.getAllListenersBackpressure, true);
  });

  it('should expose a getListenerConsumerBackpressure method', async () => {
    assert.equal(!!streamEmitter.getListenerConsumerBackpressure, true);
  });

  it('should expose a hasListenerConsumer method', async () => {
    assert.equal(!!streamEmitter.hasListenerConsumer, true);
  });

  it('should expose a hasAnyListenerConsumer method', async () => {
    assert.equal(!!streamEmitter.hasAnyListenerConsumer, true);
  });
});
