const fs = require('fs');
const documentation = require('documentation');
const streamArray = require('stream-array');
const vfs = require('vinyl-fs');

const fileNames = ['../src/core/core_op.js', '../src/core/core_port.js', '../src/core/core_patch.js']; // fs.readdirSync('../src/core').map(fileName => `../src/core/${fileName}`);

console.log(fileNames);
documentation
  .build(fileNames, { shallow: false })
  .then(documentation.formats.html)
  .then(output => streamArray(output).pipe(vfs.dest('./output-test')));
