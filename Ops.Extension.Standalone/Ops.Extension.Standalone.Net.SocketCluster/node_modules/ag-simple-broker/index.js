const AsyncStreamEmitter = require('async-stream-emitter');
const StreamDemux = require('stream-demux');
const AGChannel = require('ag-channel');

function SimpleExchange(broker) {
  AsyncStreamEmitter.call(this);

  this.id = 'exchange';
  this._broker = broker;
  this._channelMap = {};
  this._channelEventDemux = new StreamDemux();
  this._channelDataDemux = new StreamDemux();
}

SimpleExchange.prototype = Object.create(AsyncStreamEmitter.prototype);

SimpleExchange.prototype.transmit = function (event, packet) {
  if (event === '#publish') {
    this._channelDataDemux.write(packet.channel, packet.data);
  }
};

SimpleExchange.prototype.getBackpressure = function () {
  return Math.max(
    this.getAllListenersBackpressure(),
    this.getAllChannelsBackpressure()
  );
};

SimpleExchange.prototype.destroy = function () {
  this._broker.closeAllListeners();
};

SimpleExchange.prototype._triggerChannelSubscribe = function (channel) {
  let channelName = channel.name;

  channel.state = AGChannel.SUBSCRIBED;

  this._channelEventDemux.write(`${channelName}/subscribe`, {});
  this._broker.subscribeClient(this, channelName);
  this.emit('subscribe', {channel: channelName});
};

SimpleExchange.prototype._triggerChannelUnsubscribe = function (channel) {
  let channelName = channel.name;

  delete this._channelMap[channelName];
  if (channel.state === AGChannel.SUBSCRIBED) {
    this._channelEventDemux.write(`${channelName}/unsubscribe`, {});
    this._broker.unsubscribeClient(this, channelName);
    this.emit('unsubscribe', {channel: channelName});
  }
};

SimpleExchange.prototype.transmitPublish = async function (channelName, data) {
  return this._broker.transmitPublish(channelName, data);
};

SimpleExchange.prototype.invokePublish = async function (channelName, data) {
  return this._broker.invokePublish(channelName, data);
};

SimpleExchange.prototype.subscribe = function (channelName) {
  let channel = this._channelMap[channelName];

  if (!channel) {
    channel = {
      name: channelName,
      state: AGChannel.PENDING
    };
    this._channelMap[channelName] = channel;
    this._triggerChannelSubscribe(channel);
  }

  let channelIterable = new AGChannel(
    channelName,
    this,
    this._channelEventDemux,
    this._channelDataDemux
  );

  return channelIterable;
};

SimpleExchange.prototype.unsubscribe = async function (channelName) {
  let channel = this._channelMap[channelName];

  if (channel) {
    this._triggerChannelUnsubscribe(channel);
  }
};

SimpleExchange.prototype.channel = function (channelName) {
  let currentChannel = this._channelMap[channelName];

  let channelIterable = new AGChannel(
    channelName,
    this,
    this._channelEventDemux,
    this._channelDataDemux
  );

  return channelIterable;
};

SimpleExchange.prototype.closeChannel = function (channelName) {
  this.channelCloseOutput(channelName);
  this.channelCloseAllListeners(channelName);
};

SimpleExchange.prototype.closeAllChannelOutputs = function () {
  this._channelDataDemux.closeAll();
};

SimpleExchange.prototype.closeAllChannelListeners = function () {
  this._channelEventDemux.closeAll();
};

SimpleExchange.prototype.closeAllChannels = function () {
  this.closeAllChannelOutputs();
  this.closeAllChannelListeners();
};

SimpleExchange.prototype.killChannel = function (channelName) {
  this.channelKillOutput(channelName);
  this.channelKillAllListeners(channelName);
};

SimpleExchange.prototype.killAllChannelOutputs = function () {
  this._channelDataDemux.killAll();
};

SimpleExchange.prototype.killAllChannelListeners = function () {
  this._channelEventDemux.killAll();
};

SimpleExchange.prototype.killAllChannels = function () {
  this.killAllChannelOutputs();
  this.killAllChannelListeners();
};

SimpleExchange.prototype.killChannelOutputConsumer = function (consumerId) {
  this._channelDataDemux.killConsumer(consumerId);
};

SimpleExchange.prototype.killChannelListenerConsumer = function (consumerId) {
  this._channelEventDemux.killConsumer(consumerId);
};

SimpleExchange.prototype.getChannelOutputConsumerStats = function (consumerId) {
  return this._channelDataDemux.getConsumerStats(consumerId);
};

SimpleExchange.prototype.getChannelListenerConsumerStats = function (consumerId) {
  return this._channelEventDemux.getConsumerStats(consumerId);
};

SimpleExchange.prototype.getAllChannelOutputsConsumerStatsList = function () {
  return this._channelDataDemux.getConsumerStatsListAll();
};

SimpleExchange.prototype.getAllChannelListenersConsumerStatsList = function () {
  return this._channelEventDemux.getConsumerStatsListAll();
};

SimpleExchange.prototype.getChannelBackpressure = function (channelName) {
  return Math.max(
    this.channelGetOutputBackpressure(channelName),
    this.channelGetAllListenersBackpressure(channelName)
  );
};

SimpleExchange.prototype.getAllChannelOutputsBackpressure = function () {
  return this._channelDataDemux.getBackpressureAll();
};

SimpleExchange.prototype.getAllChannelListenersBackpressure = function () {
  return this._channelEventDemux.getBackpressureAll();
};

SimpleExchange.prototype.getAllChannelsBackpressure = function () {
  return Math.max(
    this.getAllChannelOutputsBackpressure(),
    this.getAllChannelListenersBackpressure()
  );
};

SimpleExchange.prototype.getChannelListenerConsumerBackpressure = function (consumerId) {
  return this._channelEventDemux.getConsumerBackpressure(consumerId);
};

SimpleExchange.prototype.getChannelOutputConsumerBackpressure = function (consumerId) {
  return this._channelDataDemux.getConsumerBackpressure(consumerId);
};

SimpleExchange.prototype.hasAnyChannelOutputConsumer = function (consumerId) {
  return this._channelDataDemux.hasConsumerAll(consumerId);
};

SimpleExchange.prototype.hasAnyChannelListenerConsumer = function (consumerId) {
  return this._channelEventDemux.hasConsumerAll(consumerId);
};

SimpleExchange.prototype.getChannelState = function (channelName) {
  let channel = this._channelMap[channelName];
  if (channel) {
    return channel.state;
  }
  return AGChannel.UNSUBSCRIBED;
};

SimpleExchange.prototype.getChannelOptions = function (channelName) {
  return {};
};

SimpleExchange.prototype._getAllChannelStreamNames = function (channelName) {
  let streamNamesLookup = this._channelEventDemux.getConsumerStatsListAll()
  .filter((stats) => {
    return stats.stream.indexOf(`${channelName}/`) === 0;
  })
  .reduce((accumulator, stats) => {
    accumulator[stats.stream] = true;
    return accumulator;
  }, {});
  return Object.keys(streamNamesLookup);
};

SimpleExchange.prototype.channelCloseOutput = function (channelName) {
  this._channelDataDemux.close(channelName);
};

SimpleExchange.prototype.channelCloseListener = function (channelName, eventName) {
  this._channelEventDemux.close(`${channelName}/${eventName}`);
};

SimpleExchange.prototype.channelCloseAllListeners = function (channelName) {
  let listenerStreams = this._getAllChannelStreamNames(channelName)
  .forEach((streamName) => {
    this._channelEventDemux.close(streamName);
  });
};

SimpleExchange.prototype.channelKillOutput = function (channelName) {
  this._channelDataDemux.kill(channelName);
};

SimpleExchange.prototype.channelKillListener = function (channelName, eventName) {
  this._channelEventDemux.kill(`${channelName}/${eventName}`);
};

SimpleExchange.prototype.channelKillAllListeners = function (channelName) {
  let listenerStreams = this._getAllChannelStreamNames(channelName)
  .forEach((streamName) => {
    this._channelEventDemux.kill(streamName);
  });
};

SimpleExchange.prototype.channelGetOutputConsumerStatsList = function (channelName) {
  return this._channelDataDemux.getConsumerStatsList(channelName);
};

SimpleExchange.prototype.channelGetListenerConsumerStatsList = function (channelName, eventName) {
  return this._channelEventDemux.getConsumerStatsList(`${channelName}/${eventName}`);
};

SimpleExchange.prototype.channelGetAllListenersConsumerStatsList = function (channelName) {
  return this._getAllChannelStreamNames(channelName)
  .map((streamName) => {
    return this._channelEventDemux.getConsumerStatsList(streamName);
  })
  .reduce((accumulator, statsList) => {
    statsList.forEach((stats) => {
      accumulator.push(stats);
    });
    return accumulator;
  }, []);
};

SimpleExchange.prototype.channelGetOutputBackpressure = function (channelName) {
  return this._channelDataDemux.getBackpressure(channelName);
};

SimpleExchange.prototype.channelGetListenerBackpressure = function (channelName, eventName) {
  return this._channelEventDemux.getBackpressure(`${channelName}/${eventName}`);
};

SimpleExchange.prototype.channelGetAllListenersBackpressure = function (channelName) {
  let listenerStreamBackpressures = this._getAllChannelStreamNames(channelName)
  .map((streamName) => {
    return this._channelEventDemux.getBackpressure(streamName);
  });
  return Math.max(...listenerStreamBackpressures.concat(0));
};

SimpleExchange.prototype.channelHasOutputConsumer = function (channelName, consumerId) {
  return this._channelDataDemux.hasConsumer(channelName, consumerId);
};

SimpleExchange.prototype.channelHasListenerConsumer = function (channelName, eventName, consumerId) {
  return this._channelEventDemux.hasConsumer(`${channelName}/${eventName}`, consumerId);
};

SimpleExchange.prototype.channelHasAnyListenerConsumer = function (channelName, consumerId) {
  return this._getAllChannelStreamNames(channelName)
  .some((streamName) => {
    return this._channelEventDemux.hasConsumer(streamName, consumerId);
  });
};

SimpleExchange.prototype.subscriptions = function (includePending) {
  let subs = [];
  Object.keys(this._channelMap).forEach((channelName) => {
    if (includePending || this._channelMap[channelName].state === AGChannel.SUBSCRIBED) {
      subs.push(channelName);
    }
  });
  return subs;
};

SimpleExchange.prototype.isSubscribed = function (channelName, includePending) {
  let channel = this._channelMap[channelName];
  if (includePending) {
    return !!channel;
  }
  return !!channel && channel.state === AGChannel.SUBSCRIBED;
};


function AGSimpleBroker() {
  AsyncStreamEmitter.call(this);

  this.isReady = false;
  this._codec = null;
  this._exchangeClient = new SimpleExchange(this);
  this._clientSubscribers = {};
  this._clientSubscribersCounter = {};

  setTimeout(() => {
    this.isReady = true;
    this.emit('ready', {});
  }, 0);
}

AGSimpleBroker.prototype = Object.create(AsyncStreamEmitter.prototype);

AGSimpleBroker.prototype.exchange = function () {
  return this._exchangeClient;
};

AGSimpleBroker.prototype.subscribeClient = async function (client, channelName) {
  if (!this._clientSubscribers[channelName]) {
    this._clientSubscribers[channelName] = {};
    this._clientSubscribersCounter[channelName] = 0;
    this.emit('subscribe', {
      channel: channelName
    });
  }
  if (!this._clientSubscribers[channelName][client.id]) {
    this._clientSubscribersCounter[channelName]++;
  }
  this._clientSubscribers[channelName][client.id] = client;
};

AGSimpleBroker.prototype.subscribeSocket = AGSimpleBroker.prototype.subscribeClient;

AGSimpleBroker.prototype.unsubscribeClient = async function (client, channelName) {
  if (this._clientSubscribers[channelName]) {
    if (this._clientSubscribers[channelName][client.id]) {
      this._clientSubscribersCounter[channelName]--;
      delete this._clientSubscribers[channelName][client.id];

      if (this._clientSubscribersCounter[channelName] <= 0) {
        delete this._clientSubscribers[channelName];
        delete this._clientSubscribersCounter[channelName];
        this.emit('unsubscribe', {
          channel: channelName
        });
      }
    }
  }
};

AGSimpleBroker.prototype.unsubscribeSocket = AGSimpleBroker.prototype.unsubscribeClient;

AGSimpleBroker.prototype.subscriptions = function () {
  return Object.keys(this._clientSubscribers);
};

AGSimpleBroker.prototype.isSubscribed = function (channelName) {
  return !!this._clientSubscribers[channelName];
};

AGSimpleBroker.prototype.setCodecEngine = function (codec) {
  this._codec = codec;
};

// In this implementation of the broker engine, both invokePublish and transmitPublish
// methods are the same. In alternative implementations, they could be different.
AGSimpleBroker.prototype.invokePublish = async function (channelName, data, suppressEvent) {
  return this.transmitPublish(channelName, data, suppressEvent);
};

AGSimpleBroker.prototype.transmitPublish = async function (channelName, data, suppressEvent) {
  let packet = {
    channel: channelName,
    data
  };
  let transmitOptions = {};

  if (this._codec) {
    // Optimization
    try {
      transmitOptions.stringifiedData = this._codec.encode({
        event: '#publish',
        data: packet
      });
    } catch (error) {
      this.emit('error', {error});
      return;
    }
  }

  let subscriberClients = this._clientSubscribers[channelName] || {};

  Object.keys(subscriberClients).forEach((i) => {
    subscriberClients[i].transmit('#publish', packet, transmitOptions);
  });

  if (!suppressEvent) {
    this.emit('publish', packet);
  }
};

module.exports = AGSimpleBroker;
