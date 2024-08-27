const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'index.js',
  output: {
    file: 'async-stream-emitter.min.js',
    format: 'es'
  },
  plugins: [
    commonjs(),
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    terser()
  ]
};
