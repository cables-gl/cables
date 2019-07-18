const { exec } = require('child_process');

/**
 * Generates a gitbook documentation to "_book"
 */

function generateGitbook() {
  exec('gitbook build', (error, stdout, stderr) => {
    console.log('stdout:', stdout);

    if (stderr.toString() !== '') {
      console.log('stderr:', stderr);
    }

    if (error !== null) throw new Error(error);
    // success
    else {
      console.log('Gitbook generation finished.');
    }
  });
}

const generateJSDoc = () => exec('node generate-jsdoc.js', (err, stdout, stderr) => {
  console.log('stdout:', stdout);
  if (stderr.toString() !== '') {
    console.error('stderr:', stderr);
  }
  if (err !== null) {
    throw new Error(err);
  } else {
    console.log('JSDoc generation finished. Starting gitbook generation. This may take a few minutes...');
    generateGitbook();
  }
});

exec('node add_ops.js', (error, stdout, stderr) => {
  console.log('stdout:', stdout);
  if (stderr.toString() !== '') {
    console.log('stderr:', stderr);
  }

  if (error !== null) throw new Error(error);
  // success
  else {
    console.log(
      'Summary generation / op-markdown copy finished. Now generating jsdoc-Documentation from comments.',
    );
    generateJSDoc();
  }
});
