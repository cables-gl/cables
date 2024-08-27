const formatter = require('../index.js');
const assert = require('assert');

describe('sc-formatter', function () {

  let ab2str = function (buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  let str2ab = function (str) {
    let buf = new ArrayBuffer(str.length);
    let bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  describe('sc-formatter#encode', function () {
    it('should encode an Object into a string', function (done) {
      let rawObject = {
        foo: 123,
        arr: [1, 2, 3, 4],
        complexArr: [
          {a: 1, b: 2},
          {c: 3, d: 4, e: 5},
          {foo: 'bar'},
          ['a', 'b', 'c', {nested: 'object'}]
        ],
        ob: {hi: 'hello'}
      };
      rawObject.complexArr.push(rawObject.arr);

      let encoded = formatter.encode(rawObject);
      let expected = JSON.stringify(rawObject);
      assert(encoded == expected, 'Encoded data did not match expected output');
      done();
    });

    it('should serialize binary Buffer objects to base64 strings', function (done) {
      let rawObject = {
        foo: 123,
        buff: Buffer.from('hello', 'utf8'),
        buffArr: [Buffer.from('world', 'utf8')]
      };
      let encoded = formatter.encode(rawObject);
      let expected = JSON.stringify({
        foo: 123,
        buff: {base64: true, data: 'aGVsbG8='},
        buffArr: [
          {base64: true, data: 'd29ybGQ='}
        ]
      });
      assert(encoded == expected, 'Encoded data did not match expected output');
      done();
    });

    it('should serialize binary ArrayBuffer objects to base64 strings', function (done) {
      let rawObject = {
        foo: 123,
        buff: str2ab('hello'),
        buffArr: [str2ab('world')]
      };
      let encoded = formatter.encode(rawObject);
      let expected = JSON.stringify({
        foo: 123,
        buff: {base64: true, data: 'aGVsbG8='},
        buffArr: [
          {base64: true, data: 'd29ybGQ='}
        ]
      });
      assert(encoded == expected, 'Encoded data did not match expected output');
      done();
    });

    it('should throw error if there is a circular structure - Basic', function (done) {
      let rawObject = {
        foo: 123,
        arr: []
      };
      rawObject.arr.push(rawObject);

      let error;
      try {
        let encoded = formatter.encode(rawObject);
      } catch (err) {
        error = err;
      }
      assert(error != null, 'Expected an error to be thrown');
      done();
    });

    it('should throw error if there is a circular structure - Single level nesting', function (done) {
      let rawObject = {
        foo: {hello: 'world'}
      };
      rawObject.foo.bar = rawObject.foo;

      let error;
      try {
        let encoded = formatter.encode(rawObject);
      } catch (err) {
        error = err;
      }
      assert(error != null, 'Expected an error to be thrown');
      done();
    });

    it('should throw error if there is a circular structure - Deep nesting', function (done) {
      let rawObject = {
        foo: {
          hello: 'world',
          bar: {
            deep: {}
          }
        }
      };
      rawObject.foo.bar.deep = rawObject.foo;

      let error;
      try {
        let encoded = formatter.encode(rawObject);
      } catch (err) {
        error = err;
      }
      assert(error != null, 'Expected an error to be thrown');
      done();
    });

    it('should ignore prototype properties', function (done) {
      Object.prototype.prototypeProperty = 456;
      let rawObject = {
        foo: 123
      };
      let encoded = formatter.encode(rawObject);
      let expected = '{"foo":123}';
      assert(encoded == expected, 'Encoded data did not match expected output');
      delete Object.prototype.prototypeProperty;
      done();
    });

    it('should ignore properties which contain functions', function (done) {
      let rawObject = {
        foo: 123,
        fun: function () {
          return 456;
        }
      };
      let encoded = formatter.encode(rawObject);
      let expected = JSON.stringify({foo: 123});
      assert(encoded == expected, 'Encoded data did not match expected output');
      done();
    });
  });
});
