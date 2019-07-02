const fs = require('fs-extra');
const util = require('util');
const stream = require('stream');
const documentation = require('documentation');
const replace = require('replace-in-file');

const { html } = documentation.formats;
const streamArray = require('stream-array');
const vfs = require('vinyl-fs');

const pipeline = util.promisify(stream.pipeline);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
  '../src/core/cgl_framebuffer.js',
  '../src/core/0_utils.js',
];

console.log('Creating documentation for ', fileNames);

const names = [];

const promises = fileNames.map(async (fileName, index) => {
  try {
    const comments = await documentation.build([fileName], { shallow: false });
    const name = comments[0].namespace.toLowerCase();
    names.push(name);
    const htmlOutput = await html(comments, { theme: 'theme' });
    await pipeline(streamArray(htmlOutput), vfs.dest(`./temp/${name}`));
    if (index === 0) {
      await pipeline(streamArray(htmlOutput), vfs.dest('./output'));
      await fs.remove('./output/index.html');
    }
  } catch (err) {
    throw err;
  }
});

Promise.all(promises).then(() => {
  Promise.all(
    names.map(async (name) => {
      try {
        await fs.copyFile(
          `${__dirname}/temp/${name}/index.html`,
          `${__dirname}/output/${name}.html`,
        );
        await fs.remove(`${__dirname}/temp/${name}`);
      } catch (err) {
        console.error('ERROR:', err);
      }
    }),
  ).then((res) => {
    fs.removeSync(`${__dirname}/temp/`);
    const htmlFiles = names.map(name => `${__dirname}/output/${name}.html`);
    const capitalNames = names.map(capitalizeFirstLetter);
    const anchorEls = capitalNames.map(
      capitalName => `: <a href="./${capitalName.toLowerCase()}.html">${capitalName}</a>`,
    );
    const regExps = capitalNames.map(name => new RegExp(`: ${name}`, 'g'));

    const replacePromises = capitalNames.map(async () => {
      try {
        await replace({
          files: htmlFiles,
          from: regExps,
          to: anchorEls,
        });
      } catch (err) {
        console.error('ERR IN REPLACE', err);
      }
    });

    Promise.all(replacePromises).then(() => console.log('Created documentation.'));
  });
});
