# consumable-stream
A readable stream which can be iterated over using a for-await-of loop or using a while loop with await inside.

The `ConsumableStream` constructor is an abstract class which must be subclassed. Its `next()` and `createConsumer()` methods must be overriden.

For a concrete subclass of `ConsumableStream`, see `WritableConsumableStream`: https://github.com/SocketCluster/writable-consumable-stream

## Installation

```
npm install consumable-stream
```

## Usage

The `ConsumableStream` class exposes the following methods:

- `[Symbol.asyncIterator]`: Makes the instance iterable using a for-await-of loop.
- `next`: Returns a `Promise` which will resolve an object in the form `{value: data, done: boolean}` whenever some data is received or when the stream ends.
- `once`: Similar to `next()` except that the resolved value will be the raw data and it will not resolve when the stream ends. Note that once `once()` is called, it cannot be cancelled; the affected closure will stay in memory until either `once()` resolves or until the stream is ended or garbage collected.

```js
// Consume data objects from consumableStream as they are written to the stream.
(async () => {
  for await (let data of consumableStream) {
    console.log(data);
  }
})();

// Consume only the next data object which is written to the stream.
(async () => {
  let data = await consumableStream.once();
  console.log(data);
})();
```
