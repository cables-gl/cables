var CABLES=CABLES||{};

CABLES.base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Use a lookup table to find the index.
CABLES.base64lookup = new Uint8Array(256);
for (var i = 0; i < CABLES.base64Chars.length; i++) CABLES.base64lookup[CABLES.base64Chars.charCodeAt(i)] = i;

CABLES.b64encTypesArray = function(arraybuffer) {
    if(arraybuffer.buffer)arraybuffer=arraybuffer.buffer;
  var bytes = new Uint8Array(arraybuffer),
  i, len = bytes.length, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += CABLES.base64Chars[bytes[i] >> 2];
    base64 += CABLES.base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += CABLES.base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += CABLES.base64Chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) base64 = base64.substring(0, base64.length - 1) + "=";
      else if (len % 3 === 1) base64 = base64.substring(0, base64.length - 2) + "==";

  return base64;
};

CABLES.b64decTypedArray =  function(base64) {
  var bufferLength = base64.length * 0.75,
  len = base64.length, i, p = 0,
  encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") bufferLength--;
  }

  var arraybuffer = new ArrayBuffer(bufferLength),
  bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i+=4) {
    encoded1 = CABLES.base64lookup[base64.charCodeAt(i)];
    encoded2 = CABLES.base64lookup[base64.charCodeAt(i+1)];
    encoded3 = CABLES.base64lookup[base64.charCodeAt(i+2)];
    encoded4 = CABLES.base64lookup[base64.charCodeAt(i+3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
};



