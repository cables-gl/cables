import path from "path";
import fs from "fs";

export default (isProduction = false) =>
{
    const getDirectories = function (arr)
    {
        const names = [];
        for (let i = 0; i < arr.length; i++)
        {
            const dirent = arr[i];
            if (dirent.isDirectory() && !dirent.name.startsWith("."))
            {
                names.push(dirent.name);
            }
        }
        return names;
    };

    const getJsFiles = function (arr)
    {
        const names = [];
        for (let i = 0; i < arr.length; i++)
        {
            const dirent = arr[i];
            if (!dirent.isDirectory() && !dirent.name.startsWith(".") && dirent.name.endsWith(".js"))
            {
                names.push(dirent.name);
            }
        }
        return names;
    };

    const raiseFirstChar = (str) => { return str.charAt(0).toUpperCase() + str.substring(1); };
    const flattenArray = (arr) => { return [].concat.apply([], arr); }; // .flat() only availible in Node 11+

    const createOutputEntryObjectsNamespace = (namespace) =>
    {
        const outputs = [];
        const dirContent = fs.readdirSync(
            path.join(__dirname, "src", "libs", namespace),
            { "withFileTypes": true }
        );

        const namespaceFiles = getJsFiles(dirContent);
        const namespaceSubDirectories = getDirectories(dirContent);

        for (let i = 0; i < namespaceFiles.length; i++)
        {
            const file = namespaceFiles[i];
            const baseName = file.split(".")[0];
            const targetName = namespace === "cables" ? baseName : namespace + "_" + baseName;
            outputs.push(
                {
                    "entry": path.join(__dirname, "src", "libs", namespace, file),
                    "output": {
                        "filename": isProduction ? targetName + ".min.js" : targetName + ".max.js",
                        "path": path.join(__dirname, "build", "libs"),
                        "library": [namespace.toUpperCase(), "COREMODULES", raiseFirstChar(baseName)],
                        "libraryExport": raiseFirstChar(namespace),
                        "libraryTarget": "this"
                    }
                }
            );
        }

        for (let i = 0; i < namespaceSubDirectories.length; i++)
        {
            const subdir = namespaceSubDirectories[i];
            const targetName = namespace === "cables" ? subdir : namespace + "_" + subdir;
            outputs.push(
                {
                    "entry": path.join(__dirname, "src", "libs", namespace, subdir, "index.js"),
                    "output": {
                        "filename": isProduction ? targetName + ".min.js" : targetName + ".max.js",
                        "path": path.join(__dirname, "build", "libs"),
                        "library": [namespace.toUpperCase(), "COREMODULES", raiseFirstChar(subdir)],
                        "libraryExport": raiseFirstChar(subdir),
                        "libraryTarget": "this",
                    }
                }
            );
        }
        return outputs;
    };

    const readLibraryFiles = () =>
    {
        const LIBDIR_ENTRIES = fs.readdirSync(
            path.join(__dirname, "src", "libs"),
            { "withFileTypes": true }
        );

        const NAMESPACE_DIRS = getDirectories(LIBDIR_ENTRIES);

        const outputObjects = [];
        for (let i = 0; i < NAMESPACE_DIRS.length; i++)
        {
            const namespace = NAMESPACE_DIRS[i];
            outputObjects.push(createOutputEntryObjectsNamespace(namespace, isProduction));
        }

        return flattenArray(outputObjects);
    };

    const __dirname = new URL(".", import.meta.url).pathname;
    const entryAndOutputObjects = readLibraryFiles(isProduction);
    const defaultConfig = {
        "mode": "production",
        "devtool": false,
        "optimization": {
            "minimize": isProduction, // * NOTE: hard to debug with this setting, if set to "false", file size increases but more readability
            "usedExports": true
        },
        "module": {
            "rules": [
                { "sideEffects": false },
                {
                    "test": /\.frag/,
                    "use": "raw-loader",
                },
                {
                    "test": /\.vert/,
                    "use": "raw-loader",
                }
            ].filter(Boolean),
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
