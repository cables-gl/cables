var fs = require('fs');
const exec = require('child_process').exec;

/**
 * Generates a gitbook documentation to "_book"
 */

const child = exec('node add_ops.js',
  (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    if(stderr.toString() !== "" ) { console.log(`stderr: ${stderr}`); }
    if (error !== null) {
      throw new Error( `${error}` );
    }
    // success
    else {
      console.log("Op doc generation finished.");
      generateGitbook();
    }
});

function generateGitbook(){
  const child = exec('gitbook build',
    (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      if(stderr.toString() !== "" ) { console.log(`stderr: ${stderr}`); }
      if (error !== null) {
        throw new Error( `${error}` );
      }
      // success
      else {
        console.log("Gitbook generation finished.");
      }
  });
}
