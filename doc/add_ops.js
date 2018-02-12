var fs = require("fs");
var fsSync = require('fs-sync');
var path = require("path");

/**
 * Goes throuh all base ops and creates a link in the documentation index (SUMMARY.md).
 * Markdown-files must be manually copied (it didn't work with symlinks).
 *
 * TODO: Create categories for e.g. "WebAudio".
 */

var OP_DIR = "../src/ops/base"; // should point to /ops/base
var OPS_TMP_DIR = "ops";
var CATEGORY_DESCRIPTION_FOLDER = "chapter_readmes"

var versionRegEx = new RegExp(/^[vV]{1}\d{1,2}$/); // e.g. "v2" / "V2"
var opWithVersionRegEx = new RegExp(/.\.[vV]{1}\d{1,2}$/);

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
 * Returns true if the op name (e.g. "Ops.Math.Random.V2") contains
 * a version at the end ("V2")
 */
function isVersionedOp(op) {
  return opWithVersionRegEx.test(op);
}

/**
 * Returns an op-name without version-number at the end
 * (e.g. "Ops.Math.Random.V2" -> "Ops.Math.Random")
 */
function getUnversionedOpName(op) {
  if( isVersionedOp(op) ) {
    var iDot = op.lastIndexOf(".");
    var strippedOpName = op.substring(0, iDot);
    return strippedOpName;
  }
  return op;
}

/**
 * Checks if an array contrains an element
 */
function arrayContains(arr, element) {
    return (arr.indexOf(element) > -1);
}

var opCategories = [];

/**
 * Checks if there is already an op-category in SUMMARY.md, if not creates one
 * @param category e.g. "WebAudio"
 * @param categoryFull e.g. Ops.WebAudio (this should not contain any sub-categories beyond this category)
 * @param indents number of indents for the list rendering
 */
function createOpCategory(category, indents) {
  if(!arrayContains(opCategories, category) && category) {
      console.log("Creating op category: " + category);
      var text = "";
      for (var i=0; i<indents; i++) {
        text += "\t";
      }
      text += "* [" + category + "](" + "chapter_readmes" + "/" + category.toLowerCase() + "/readme.md" + ")\n"; // e.g. "* [WebAudio](chapter_readmes/webaudio/Readme.md)"
      fs.appendFileSync('SUMMARY.md', text);
      opCategories.push(category);
      // create category markdown file
      var folder = CATEGORY_DESCRIPTION_FOLDER + "/" + category.toLowerCase().replace(' ', '_');
      var filename =  "readme.md";
      var relFilename = folder + "/" + filename;
      var defaultReadmeText = "#" + category;
      if(!fs.existsSync(relFilename)) {
          if( !fs.existsSync(folder) ) { fs.mkdirSync(folder); }
          fs.writeFileSync(folder + "/" + filename, defaultReadmeText);
      }
  }
}

/**
 * Creates a new array without the "v2" / "V2" part of an ops name.
 * @param opArr {Array}: The single parts of an ops name, e.g. ["Ops", "WebAudio", "Bang", "v2"]
 * @return {Array}: New Array with the op-name-components, e.g. ["Ops", "WebAudio", "Bang"]
 */
function stripVersionPartFromOp(opArr) {
  if( !versionRegEx.test(opArr) ) { return opArr; } // nothing to do here
  var newArr = [];
  for(var i=0; i<opArr.length; i++) {
    // strip the "v2" part
    if(i==opArr.length-2) {
      newArr.push(opArr[i]);
      return newArr;
    } else {
      newArr.push(opArr[i]);
    }
  }
}

/**
 * Adds a link-entry of the op to the file "SUMMARY.md".
 * Note: Will not work on Windows because of different path separator.
 * @param {String} filename: Complete path, e.g. "/Users/me/gitbook/SomeFile.md"
 */
function createOpEntry(filename) {
  if(filename.indexOf("Deprecated") > -1) return;
  var lastSlash = filename.lastIndexOf("/");
  var mdFilename = filename.substring(lastSlash+1); // e.g. "SomeFile.md""
  var lastDot = mdFilename.lastIndexOf(".");
  var suffix = mdFilename.substring(0, lastDot); // e.g. "SomeFile"
  var parts = suffix.split('.');
  // if op has a version number (e.g. "v2" / "V2", strip it)
  //if(versionRegEx.test(parts[parts.length-1])) { // matches "v2" / "V2"
  if( opWithVersionRegEx.test(suffix) ) {
    console.log("Op With Version: " + suffix);
    suffix = getUnversionedOpName(suffix);
    console.log("New suffix: " + suffix);
    parts = suffix.split('.');
    mdFilename = suffix + ".md";
    console.log("New filename: " + mdFilename);
    console.log("New parts: " + parts);
  }
  // Copy Markdown file
  fsSync.copy(filename, OPS_TMP_DIR + "/" + suffix + "/" + mdFilename);
  // Copy img-folder with images
  var lastSeparator = filename.lastIndexOf("/");
  var imgDir = filename.substring(0, lastSeparator) + "/" + "img";
  console.log("Image dir: " + imgDir);
  if(fs.existsSync(imgDir)) {
    fsSync.copy(imgDir, OPS_TMP_DIR + "/" + suffix + "/" + "img");
  }
  // Create markdown-entry based on the namespace (number of tabs)
  var text = "";
  if(parts.length > 2) { // 0 = no name, 1 = bad name
    for(var j=1; j<parts.length-1; j++) {
      // category string including parts[j], e.g. "Ops.WebAudio"
      var categoryFull = parts.splice(0, j + 1).reduce(function(acc, val, index, arr) { 
        return index < arr.length-1 ? acc + val + ".": acc + val;
      }, "");
      //createOpCategory(parts[j], categoryFull, j);
      createOpCategory(parts[j], j);
    }
    for(var i=0; i<parts.length-1; i++) {
      text += "\t";
    }
    text += "* [" + parts[parts.length-1] + "](" + OPS_TMP_DIR + "/" + suffix + "/" + mdFilename + ")\n";
  }
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
  mdFiles.forEach(createOpEntry);
}

// make a copy of the "hand-made"-summary and create op-entries afterwards
//copyFile("SUMMARY_base.md", "SUMMARY.md", createOpEntries);
fsSync.remove("SUMMARY.md");
fsSync.copy("SUMMARY_base.md", "SUMMARY.md");
// createOpEntries(); /* we display the op docs on the cables main page now... */
console.log("Done.");
