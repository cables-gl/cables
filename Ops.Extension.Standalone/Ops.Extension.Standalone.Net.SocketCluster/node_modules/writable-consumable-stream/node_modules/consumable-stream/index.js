class ConsumableStream {
  async next(timeout) {
    let asyncIterator = this.createConsumer(timeout);
    let result = await asyncIterator.next();
    asyncIterator.return();
    return result;
  }

  async once(timeout) {
    let result = await this.next(timeout);
    if (result.done) {
      // If stream was ended, this function should never resolve unless
      // there is a timeout; in that case, it should reject early.
      if (timeout == null) {
        await new Promise(() => {});
      } else {
        let error = new Error(
          'Stream consumer operation timed out early because stream ended'
        );
        error.name = 'TimeoutError';
        throw error;
      }
    }
    return result.value;
  }

  createConsumer() {
    throw new TypeError('Method must be overriden by subclass');
  }

  [Symbol.asyncIterator]() {
    return this.createConsumer();
  }
}

module.exports = ConsumableStream;

