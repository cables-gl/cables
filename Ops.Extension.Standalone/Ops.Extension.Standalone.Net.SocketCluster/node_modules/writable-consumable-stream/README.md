# writable-consumable-stream
An async stream which can be iterated over using a for-await-of loop and which can be written to.

The `WritableConsumableStream` class extends the `ConsumableStream` class.  
See https://github.com/SocketCluster/consumable-stream

## Installation

```
npm install writable-consumable-stream
```

## Usage

### Require

```js
const WritableConsumableStream = require('writable-consumable-stream');
```

### Consume a stream and write to it asynchronously:

```js
let consumableStream = new WritableConsumableStream();

async function consumeAsyncIterable(asyncIterable) {
  // Consume iterable data asynchronously.
  for await (let packet of asyncIterable) {
    console.log('Packet:', packet);
  }
}
consumeAsyncIterable(consumableStream);

setInterval(() => {
  // Write data to the stream asynchronously,
  consumableStream.write(`Timestamp: ${Date.now()}`);
}, 100);
```

### Consume a stream using a while loop:

```js
let consumableStream = new WritableConsumableStream();

async function consumeAsyncIterable(asyncIterable) {
  // Consume iterable data asynchronously.
  // Works in older environments.
  let asyncIterator = asyncIterable.createConsumer();
  while (true) {
    let packet = await asyncIterator.next();
    if (packet.done) break;
    console.log('Packet:', packet.value);
  }
}
consumeAsyncIterable(consumableStream);

setInterval(() => {
  // Write data to the stream asynchronously,
  consumableStream.write(`Timestamp: ${Date.now()}`);
}, 100);
```

### Consume a filtered stream using an async generator:

```js
let consumableStream = new WritableConsumableStream();

// Creates an async generator which only produces packets which are allowed by the
// specified filterFunction.
async function* createFilteredStreamGenerator(fullStream, filterFunction) {
  for await (let packet of fullStream) {
    if (filterFunction(packet)) {
      yield packet;
    }
  }
}

async function consumeAsyncIterable(asyncIterable) {
  // Consume iterable data asynchronously.
  for await (let packet of asyncIterable) {
    console.log('Packet:', packet);
  }
}

// The filter function will only include strings which end with the number 5.
function filterFn(data) {
  return /5$/.test(data);
}
let filteredStreamGenerator = createFilteredStreamGenerator(consumableStream, filterFn);

consumeAsyncIterable(filteredStreamGenerator);

setInterval(() => {
  // Write data to the stream asynchronously,
  consumableStream.write(`Timestamp: ${Date.now()}`);
}, 100);
```

### Consume only the next data object which will be written to the stream:

```js
let consumableStream = new WritableConsumableStream();

(async () => {
  let data = await consumableStream.once();
  console.log(data);
})();

setInterval(() => {
  // Write data to the stream asynchronously,
  consumableStream.write(`Timestamp: ${Date.now()}`);
}, 100);
```

See `test/` directory for additional examples.
