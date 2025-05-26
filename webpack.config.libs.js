import path, { dirname } from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import { fileURLToPath } from "url";
import ModuleScopePlugin from "@k88/module-scope-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default (isLiveBuild, buildInfo, minify = false, analyze = false, sourceMap = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));

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
                    "entry": {
                        "main": {
                            "import": path.join(__dirname, "src", "libs", namespace, file),
                            "filename": targetName + ".js"
                        }
                    },
                    "output": {
                        "path": path.join(__dirname, "build", "libs"),
                        "library": {
                            "name": namespace.toUpperCase(),
                            "type": "assign-properties"
                        }
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
                    "entry": {
                        "main": {
                            "import": path.join(__dirname, "src", "libs", namespace, subdir, "index.js"),
                            "filename": targetName + ".js"
                        }
                    },
                    "output": {
                        "path": path.join(__dirname, "build", "libs"),
                        "library": {
                            "name": namespace.toUpperCase(),
                            "type": "assign-properties"
                        }
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
            outputObjects.push(createOutputEntryObjectsNamespace(namespace, isLiveBuild));
        }

        return outputObjects.flat();
    };

    const entryAndOutputObjects = readLibraryFiles(isLiveBuild);
    const defaultConfig = {
        "mode": "production",
        "devtool": false,
        "optimization": {
            "concatenateModules": true,
            "minimizer": [new TerserPlugin({
                "extractComments": false,
                "terserOptions": { "output": { "comments": false } }
            })],
            "minimize": minify,
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
                },
                {
                    "test": /\.wgsl/,
                    "use": "raw-loader",
                }
            ].filter(Boolean),
        },
        "externals": {
            "cables": "CABLES",
            "cables-shared-client": "CABLES.CLIENT",
            "gl-matrix": "glMatrix"
        },
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
            "plugins": [
                new ModuleScopePlugin.default("src/libs/"),
            ],
        },
    };

    const configs = [];

    for (let i = 0; i < entryAndOutputObjects.length; i++)
    {
        const entryAndOutput = entryAndOutputObjects[i];
        if (analyze)
        {
            if (!entryAndOutput.plugins) entryAndOutput.plugins = [];
            const baseName = path.basename(entryAndOutput.entry.main.filename, ".js");
            entryAndOutput.plugins.push(new BundleAnalyzerPlugin({ "analyzerMode": "static", "openAnalyzer": false, "reportTitle": baseName, "reportFilename": path.join(__dirname, "build", baseName + ".html") }));
        }

        configs.push({ ...defaultConfig, ...entryAndOutput });
    }

    return configs;
};
