const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const validJSONStartRegex = /^[ \n\r\t]*[{\[]/;

let arrayBufferToBase64 = function (arraybuffer) {
  let bytes = new Uint8Array(arraybuffer);
  let len = bytes.length;
  let base64 = '';

  for (let i = 0; i < len; i += 3) {
    base64 += base64Chars[bytes[i] >> 2];
    base64 += base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += base64Chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + '==';
  }

  return base64;
};

let binaryToBase64Replacer = function (key, value) {
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return {
      base64: true,
      data: arrayBufferToBase64(value)
    };
  } else if (typeof Buffer !== 'undefined') {
    if (value instanceof Buffer){
      return {
        base64: true,
        data: value.toString('base64')
      };
    }
    // Some versions of Node.js convert Buffers to Objects before they are passed to
    // the replacer function - Because of this, we need to rehydrate Buffers
    // before we can convert them to base64 strings.
    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
      let rehydratedBuffer;
      if (Buffer.from) {
        rehydratedBuffer = Buffer.from(value.data);
      } else {
        rehydratedBuffer = new Buffer(value.data);
      }
      return {
        base64: true,
        data: rehydratedBuffer.toString('base64')
      };
    }
  }
  return value;
};

// Decode the data which was transmitted over the wire to a JavaScript Object in a format which SC understands.
// See encode function below for more details.
module.exports.decode = function (encodedMessage) {
  if (encodedMessage == null) {
   return null;
  }
  // Leave ping or pong message as is
  if (encodedMessage === '#1' || encodedMessage === '#2') {
    return encodedMessage;
  }
  let message = encodedMessage.toString();

  // Performance optimization to detect invalid JSON packet sooner.
  if (!validJSONStartRegex.test(message)) {
    return message;
  }

  try {
    return JSON.parse(message);
  } catch (err) {}
  return message;
};

// Encode raw data (which is in the SC protocol format) into a format for
// transfering it over the wire. In this case, we just convert it into a simple JSON string.
// If you want to create your own custom codec, you can encode the object into any format
// (e.g. binary ArrayBuffer or string with any kind of compression) so long as your decode
// function is able to rehydrate that object back into its original JavaScript Object format
// (which adheres to the SC protocol).
// See https://github.com/SocketCluster/socketcluster/blob/master/socketcluster-protocol.md
// for details about the SC protocol.
module.exports.encode = function (rawData) {
  // Leave ping or pong message as is
  if (rawData === '#1' || rawData === '#2') {
    return rawData;
  }
  return JSON.stringify(rawData, binaryToBase64Replacer);
};
