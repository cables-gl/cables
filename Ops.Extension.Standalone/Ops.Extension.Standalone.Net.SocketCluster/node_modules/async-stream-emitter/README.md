# async-stream-emitter
EventEmitter using ConsumableStream.

## Main methods:

- emit(eventName, data)
- listener(eventName)
- closeListener(eventName)
- closeAllListeners()
- killListener(eventName)
- killAllListeners()
- getListenerBackpressure(eventName)
- getAllListenersBackpressure()

## Usage examples

```js
let emitter = new AsyncStreamEmitter();

(async () => {
  await wait(10);
  emitter.emit('foo', 'hello');

  // This will cause all for-await-of loops for that event to exit.
  // Note that you can also use the 'break' statement inside
  // individual for-await-of loops.
  emitter.closeListener('foo');
})();

(async () => {
  for await (let data of emitter.listener('foo')) {
    // data is 'hello'
  }
  console.log('The listener was closed.');
})();

// Utility function.
function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
```
