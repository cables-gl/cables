const ConsumableStream = require('consumable-stream');

class AGChannel extends ConsumableStream {
  constructor(name, client, eventDemux, dataDemux) {
    super();
    this.PENDING = AGChannel.PENDING;
    this.SUBSCRIBED = AGChannel.SUBSCRIBED;
    this.UNSUBSCRIBED = AGChannel.UNSUBSCRIBED;

    this.name = name;
    this.client = client;

    this._eventDemux = eventDemux;
    this._dataStream = dataDemux.stream(this.name);
  }

  createConsumer(timeout) {
    return this._dataStream.createConsumer(timeout);
  }

  listener(eventName) {
    return this._eventDemux.stream(`${this.name}/${eventName}`);
  }

  close() {
    this.client.closeChannel(this.name);
  }

  kill() {
    this.client.killChannel(this.name);
  }

  killOutputConsumer(consumerId) {
    if (this.hasOutputConsumer(consumerId)) {
      this.client.killChannelOutputConsumer(consumerId);
    }
  }

  killListenerConsumer(consumerId) {
    if (this.hasAnyListenerConsumer(consumerId)) {
      this.client.killChannelListenerConsumer(consumerId);
    }
  }

  getOutputConsumerStats(consumerId) {
    if (this.hasOutputConsumer(consumerId)) {
      return this.client.getChannelOutputConsumerStats(consumerId);
    }
    return undefined;
  }

  getListenerConsumerStats(consumerId) {
    if (this.hasAnyListenerConsumer(consumerId)) {
      return this.client.getChannelListenerConsumerStats(consumerId);
    }
    return undefined;
  }

  getBackpressure() {
    return this.client.getChannelBackpressure(this.name);
  }

  getListenerConsumerBackpressure(consumerId) {
    if (this.hasAnyListenerConsumer(consumerId)) {
      return this.client.getChannelListenerConsumerBackpressure(consumerId);
    }
    return 0;
  }

  getOutputConsumerBackpressure(consumerId) {
    if (this.hasOutputConsumer(consumerId)) {
      return this.client.getChannelOutputConsumerBackpressure(consumerId);
    }
    return 0;
  }

  closeOutput() {
    this.client.channelCloseOutput(this.name);
  }

  closeListener(eventName) {
    this.client.channelCloseListener(this.name, eventName);
  }

  closeAllListeners() {
    this.client.channelCloseAllListeners(this.name);
  }

  killOutput() {
    this.client.channelKillOutput(this.name);
  }

  killListener(eventName) {
    this.client.channelKillListener(this.name, eventName);
  }

  killAllListeners() {
    this.client.channelKillAllListeners(this.name);
  }

  getOutputConsumerStatsList() {
    return this.client.channelGetOutputConsumerStatsList(this.name);
  }

  getListenerConsumerStatsList(eventName) {
    return this.client.channelGetListenerConsumerStatsList(this.name, eventName);
  }

  getAllListenersConsumerStatsList() {
    return this.client.channelGetAllListenersConsumerStatsList(this.name);
  }

  getOutputBackpressure() {
    return this.client.channelGetOutputBackpressure(this.name);
  }

  getListenerBackpressure(eventName) {
    return this.client.channelGetListenerBackpressure(this.name, eventName);
  }

  getAllListenersBackpressure() {
    return this.client.channelGetAllListenersBackpressure(this.name);
  }

  hasOutputConsumer(consumerId) {
    return this.client.channelHasOutputConsumer(this.name, consumerId);
  }

  hasListenerConsumer(eventName, consumerId) {
    return this.client.channelHasListenerConsumer(this.name, eventName, consumerId);
  }

  hasAnyListenerConsumer(consumerId) {
    return this.client.channelHasAnyListenerConsumer(this.name, consumerId);
  }

  get state() {
    return this.client.getChannelState(this.name);
  }

  set state(value) {
    throw new Error('Cannot directly set channel state');
  }

  get options() {
    return this.client.getChannelOptions(this.name);
  }

  set options(value) {
    throw new Error('Cannot directly set channel options');
  }

  subscribe(options) {
    this.client.subscribe(this.name, options);
  }

  unsubscribe() {
    this.client.unsubscribe(this.name);
  }

  isSubscribed(includePending) {
    return this.client.isSubscribed(this.name, includePending);
  }

  transmitPublish(data) {
    return this.client.transmitPublish(this.name, data);
  }

  invokePublish(data) {
    return this.client.invokePublish(this.name, data);
  }
}

AGChannel.PENDING = 'pending';
AGChannel.SUBSCRIBED = 'subscribed';
AGChannel.UNSUBSCRIBED = 'unsubscribed';

module.exports = AGChannel;
