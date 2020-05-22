const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const getDirectories = function (arr)
{
    const names = [];
    for (let i = 0; i < arr.length; i++)
    {
        const dirent = arr[i];
        if (dirent.isDirectory())
        {
            names.push(dirent.name);
        }
    }
    return names;
};


const getFiles = function (arr)
{
    const names = [];
    for (let i = 0; i < arr.length; i++)
    {
        const dirent = arr[i];
        if (!dirent.isDirectory())
        {
            names.push(dirent.name);
        }
    }
    return names;
};

const raiseFirstChar = str => str.charAt(0).toUpperCase() + str.substring(1);
const flattenArray = arr => [].concat.apply([], arr); // .flat() only availible in Node 11+

const createOutputEntryObjectsNamespace = (namespace, isProduction) =>
{
    const outputs = [];
    const namespaceSubDirectories = getDirectories(fs.readdirSync(
        path.join(__dirname, "src", "libs", namespace),
        { "withFileTypes": true }
    ));

    for (let i = 0; i < namespaceSubDirectories.length; i++)
    {
        const subdir = namespaceSubDirectories[i];
        outputs.push(
            {
                "entry": path.join(__dirname, "src", "libs", namespace, subdir, "index.js"),
                "output": {
                    "filename": `${namespace}_${subdir}.${isProduction ? "min" : "max"}.js`,
                    "path": path.join(__dirname, "build", "libs"),
                    "library": [namespace.toUpperCase(), raiseFirstChar(subdir)],
                    "libraryExport": raiseFirstChar(subdir),
                    "libraryTarget": "this",
                }
            }
        );
    }
    return outputs;
};

const createOutputEntryObjectsFile = (file, isProduction) =>
{
    const preExtension = isProduction ? ".min" : ".max";
    const parsedFile = path.parse(file);
    const filenameNoExtension = parsedFile.name;
    const extension = parsedFile.ext;

    const filename = `${filenameNoExtension}${preExtension}${extension}`;
    const raisedFilename = raiseFirstChar(filenameNoExtension);

    return {
        "entry": path.join(__dirname, "src", "libs", file),
        "output": {
            "filename": filename,
            "path": path.join(__dirname, "build", "libs"),
            "library": ["CABLES", raisedFilename], // TODO: shuld this be done? or only for classes..
            "libraryExport": raisedFilename,
            "libraryTarget": "this",
        }
    }
;};

const readLibraryFiles = (isProduction) =>
{
    const LIB_FILES = fs.readdirSync(
        path.join(__dirname, "src", "libs"),
        { "withFileTypes": true }
    );

    const NAMESPACE_DIRS = getDirectories(LIB_FILES);
    const CABLES_NAMESPACE_FILES = getFiles(LIB_FILES);

    const outputObjectsCables = [];
    for (let i = 0; i < CABLES_NAMESPACE_FILES.length; i++)
    {
        const file = CABLES_NAMESPACE_FILES[i];
        console.log(file);
        outputObjectsCables.push(createOutputEntryObjectsFile(file, isProduction));
    }
    const outputObjectsNamespace = [];
    for (let i = 0; i < NAMESPACE_DIRS.length; i++)
    {
        const namespace = NAMESPACE_DIRS[i];
        outputObjectsNamespace.push(createOutputEntryObjectsNamespace(namespace, isProduction));
    }

    return flattenArray([...outputObjectsNamespace, ...outputObjectsCables]);
};

module.exports = (isProduction = false) =>
{
    const entryAndOutputObjects = readLibraryFiles(isProduction);
    const defaultConfig = {
        "mode": "production",
        "devtool": "none",
        "optimization": {
            "minimize": isProduction // * NOTE: hard to debug with this setting, if set to "false", file size increases but more readability
        },
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
        },
    };

    const configs = [];

    for (let i = 0; i < entryAndOutputObjects.length; i++)
    {
        const entryAndOutput = entryAndOutputObjects[i];
        configs.push({ ...defaultConfig, ...entryAndOutput });
    }

    return configs;
};
