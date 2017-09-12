var fs = require('fs');

/**
 * Deletes the directory "ops" without asking.
 * This directory is generated for the gitbook documentation,
 * so only a copy of the original one.
 */

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
}

var dir = "ops"
console.log("Deleting temp ops dir: " + dir);
deleteFolderRecursive(dir);
console.log("Done.");
