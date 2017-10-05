var fs = require('fs');
const exec = require('child_process').exec;

/**
 * Generates a gitbook documentation to "_book"
 */

const child = exec('node add_ops.js',
  function(error, stdout, stderr) {
    console.log('stdout:',stdout);
    if(stderr.toString() !== "" ) { console.log('stderr:', stderr); }
    if (error !== null) {
      throw new Error( error );
    }
    // success
    else {
      console.log("Summary generation / op-markdown copy finished. Now generating the gitbook");
      console.log("This may take a few minutes...");
      generateGitbook();
    }
});

function generateGitbook(){
  const child = exec('gitbook build',
    function(error, stdout, stderr)  {
      console.log('stdout:', stdout);
      if(stderr.toString() !== "" ) { console.log('stderr:', stderr); }
      if (error !== null) {
        throw new Error( error );
      }
      // success
      else {
        console.log("Gitbook generation finished.");
      }
  });
}
