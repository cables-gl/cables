const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const getDirectories = arr =>
    arr.filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
const getFiles = arr => arr.filter(dirent => !dirent.isDirectory()).map(d => d.name);

const raiseFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1);
const flattenArray = arr => [].concat.apply([], arr); // .flat() only availible in Node 11+

const createOutputEntryObjectsNamespace = (namespace) =>
{
    const namespaceSubDirectories = getDirectories(fs.readdirSync(
        path.join(__dirname, "src", "libs", namespace),
        { "withFileTypes": true }
    ));

    return namespaceSubDirectories.map(subdir => ({
        "entry": path.join(__dirname, "src", "libs", namespace, subdir, "index.js"),
        "output": {
            "filename": namespace + "_" + subdir + ".js",
            "path": path.join(__dirname, "build", "libs"),
            "library": [namespace.toUpperCase(), raiseFirstChar(subdir)],
            "libraryExport": raiseFirstChar(subdir),
            "libraryTarget": "this",
        }
    }));
};

const createOutputEntryObjectsFile = file => ({
    "entry": path.join(__dirname, "src", "libs", file),
    "output": {
        "filename": file,
        "path": path.join(__dirname, "build", "libs"),
        "library": ["CABLES", raiseFirstChar(path.parse(file).name)], // TODO: shuld this be done? or only for classes..
        "libraryExport": raiseFirstChar(path.parse(file).name),
        "libraryTarget": "this",
    }
});

const readLibraryFiles = () =>
{
    const LIB_FILES = fs.readdirSync(
        path.join(__dirname, "src", "libs"),
        { "withFileTypes": true }
    );

    const NAMESPACE_DIRS = getDirectories(LIB_FILES);
    const CABLES_NAMESPACE_FILES = getFiles(LIB_FILES);

    const outputObjectsCables = CABLES_NAMESPACE_FILES.map(file => createOutputEntryObjectsFile(file));
    const outputObjectsNamespace = NAMESPACE_DIRS.map(namespace => createOutputEntryObjectsNamespace(namespace));

    return flattenArray([...outputObjectsCables, ...outputObjectsNamespace]);
};

module.exports = (isProduction = false, shouldBabel = false) =>
{
    const entryAndOutputObjects = readLibraryFiles();
    const defaultConfig = {
        "mode": "production",
        "devtool": "none",
        "optimization": {
            "minimize": true // * NOTE: hard to debug with this setting, if set to "false", file size increases but more readability
        },
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
        },
    };

    return entryAndOutputObjects.map((entryAndOutput, index) => ({
        ...defaultConfig,
        ...entryAndOutput,
    }));
};
