const StreamDemux = require('stream-demux');

function AsyncStreamEmitter(options) {
  this._listenerDemux = new StreamDemux();
}

AsyncStreamEmitter.prototype.emit = function (eventName, data) {
  this._listenerDemux.write(eventName, data);
};

AsyncStreamEmitter.prototype.listener = function (eventName) {
  return this._listenerDemux.stream(eventName);
};

AsyncStreamEmitter.prototype.closeListener = function (eventName) {
  this._listenerDemux.close(eventName);
};

AsyncStreamEmitter.prototype.closeAllListeners = function () {
  this._listenerDemux.closeAll();
};

AsyncStreamEmitter.prototype.removeListener = function (eventName) {
  this._listenerDemux.unstream(eventName);
};

AsyncStreamEmitter.prototype.getListenerConsumerStats = function (consumerId) {
  return this._listenerDemux.getConsumerStats(consumerId);
};

AsyncStreamEmitter.prototype.getListenerConsumerStatsList = function (eventName) {
  return this._listenerDemux.getConsumerStatsList(eventName);
};

AsyncStreamEmitter.prototype.getAllListenersConsumerStatsList = function () {
  return this._listenerDemux.getConsumerStatsListAll();
};

AsyncStreamEmitter.prototype.getListenerConsumerCount = function (eventName) {
  return this._listenerDemux.getConsumerCount(eventName);
};

AsyncStreamEmitter.prototype.getAllListenersConsumerCount = function () {
  return this._listenerDemux.getConsumerCountAll();
};

AsyncStreamEmitter.prototype.killListener = function (eventName) {
  this._listenerDemux.kill(eventName);
};

AsyncStreamEmitter.prototype.killAllListeners = function () {
  this._listenerDemux.killAll();
};

AsyncStreamEmitter.prototype.killListenerConsumer = function (consumerId) {
  this._listenerDemux.killConsumer(consumerId);
};

AsyncStreamEmitter.prototype.getListenerBackpressure = function (eventName) {
  return this._listenerDemux.getBackpressure(eventName);
};

AsyncStreamEmitter.prototype.getAllListenersBackpressure = function () {
  return this._listenerDemux.getBackpressureAll();
};

AsyncStreamEmitter.prototype.getListenerConsumerBackpressure = function (consumerId) {
  return this._listenerDemux.getConsumerBackpressure(consumerId);
};

AsyncStreamEmitter.prototype.hasListenerConsumer = function (eventName, consumerId) {
  return this._listenerDemux.hasConsumer(eventName, consumerId);
};

AsyncStreamEmitter.prototype.hasAnyListenerConsumer = function (consumerId) {
  return this._listenerDemux.hasConsumerAll(consumerId);
};

module.exports = AsyncStreamEmitter;
