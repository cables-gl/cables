const fs = require('fs');
const documentation = require('documentation');

const { html } = documentation.formats;

const streamArray = require('stream-array');
const vfs = require('vinyl-fs');

const fileNames = [
  '../src/core/core_op.js',
  '../src/core/core_port.js',
  '../src/core/core_patch.js',
  '../src/core/core_link.js',
  '../src/core/cgl_state.js',
  '../src/core/cgl_texture.js',
  '../src/core/cgl_geom.js',
  '../src/core/cgl_mesh.js',
  '../src/core/cgl_shader.js',
  '../src/core/cgl_shader_uniform.js',
  '../src/core/anim.js',
  '../src/core/timer.js',
];
// fs.readdirSync('../src/core').map(fileName => `../src/core/${fileName}`);

console.log(fileNames);

documentation
  .build(fileNames, { shallow: false })
  .then(comments => html(comments, { theme: 'theme' }))
  .then((output) => {
    streamArray(output).pipe(vfs.dest('./output-test'));
  });
