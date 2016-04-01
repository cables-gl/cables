var fs = require("fs");
var fsSync = require('fs-sync');
var path = require("path");

/**
 * Goes throuh all base ops and creates a link in the documentation index (SUMMARY.md).
 * Markdown-files must be manually copied (it didn't work with symlinks).
 *
 * TODO: Create categories for e.g. "WebAudio".
 */

var OP_DIR = "ops_base"; // a symlink to the ops/base directory should be in the same folder as the script
var OPS_TMP_DIR = "ops";

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} startPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @return {Array}               Result files with path string in an array
 */
function findFilesInDir(startPath,filter) {
    var results = [];

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            results = results.concat(findFilesInDir(filename,filter)); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            results.push(filename);
        }
    }
    return results;
}

/**
 * Adds a link-entry of the op to the file "SUMMARY.md".
 * Note: Will not work on Windows because of different path separator.
 * @param {String} filename: Complete path, e.g. "/Users/me/gitbook/SomeFile.md"
 */
function createOpEntry(filename) {
  var lastSlash = filename.lastIndexOf("/");
  var mdFilename = filename.substring(lastSlash+1); // e.g. "SomeFile.md""
  var lastDot = mdFilename.lastIndexOf(".");
  var suffix = mdFilename.substring(0, lastDot); // e.g. "SomeFile"
  fsSync.copy(filename, OPS_TMP_DIR + "/" + suffix + "/" + mdFilename);
  var text = "\t* [" + suffix + "](" + OPS_TMP_DIR + "/" + suffix + "/" + mdFilename + ")\n"; // e.g. "* [Ops.And](ops_base/Ops.And/Ops.And.md)"
  fs.appendFileSync('SUMMARY.md', text);
}

/**
 * Scans through all the ops which have a .md-file and creates an
 * entry in the doc summary for each of them
 */
function createOpEntries() {
  if(!fs.existsSync(OP_DIR)) {
    console.log("Error: Symlink to dir 'ops/base' missing, should be: " + OP_DIR);
    process.exit(1);
  }
  console.log("Deleting ops temp directory: " + OPS_TMP_DIR);
  fsSync.remove(OPS_TMP_DIR);
  fs.mkdirSync(OPS_TMP_DIR);
  console.log("Scanning for ops with a .md-file: " + OP_DIR);
  var mdFiles = findFilesInDir(OP_DIR, ".md");
  // sort md-files
  mdFiles.sort(function(a, b){
    var nameA=a.toLowerCase(), nameB=b.toLowerCase();
    if (nameA < nameB){
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0; //default return value (no sorting)
  });
  console.log("Creating entry for each .md-file in " + "SUMMARY.md");
  mdFiles.forEach(createOpEntry);
}

// make a copy of the "hand-made"-summary and create op-entries afterwards
//copyFile("SUMMARY_base.md", "SUMMARY.md", createOpEntries);
fsSync.remove("SUMMARY.md");
fsSync.copy("SUMMARY_base.md", "SUMMARY.md");
createOpEntries();
console.log("Done.");
