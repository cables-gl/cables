import path, { dirname } from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import { fileURLToPath } from "url";
import ModuleScopePlugin from "@k88/module-scope-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default (isLiveBuild, buildInfo, minify = false, analyze = false, sourceMap = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const getDirectories = function (arr, namespace)
    {
        const names = [];
        for (let i = 0; i < arr.length; i++)
        {
            const dirent = arr[i];
            if (dirent.isDirectory() && !dirent.name.startsWith("."))
            {
                const hasIndexJs = fs.existsSync(path.join(dirent.path, dirent.name, "index.js"));
                const hasNamespaceJs = fs.existsSync(path.join(dirent.path, dirent.name, dirent.name + ".js"));
                const isSubDir = dirent.path.endsWith(namespace);
                const isCoreLib = hasIndexJs || (hasNamespaceJs && !isSubDir);
                if (isCoreLib)
                {
                    names.push(dirent.name);
                }
            }
        }
        return names;
    };

    const getEntryFile = function (arr, namespace)
    {
        let entryFile = "index.js";
        const possibleEntryFiles = ["index.js", namespace + ".js"];
        const names = [];
        for (let i = 0; i < arr.length; i++)
        {
            const dirent = arr[i];
            const fileName = dirent.name;
            if (!dirent.isDirectory() && !fileName.startsWith(".") && fileName.endsWith(".js"))
            {
                names.push(dirent.name);
            }
        }
        if (names.includes("index.js"))
        {
            entryFile = "index.js";
        }
        else
        {
            entryFile = names.find((name) => { return possibleEntryFiles.includes(name); });
        }
        return entryFile;
    };

    const createOutputEntryObjectsNamespace = (namespace) =>
    {
        const outputs = [];
        const dirContent = fs.readdirSync(path.join(__dirname, "src", "libs", namespace), { "withFileTypes": true });

        const namespaceEntryFile = getEntryFile(dirContent, namespace);
        const namespaceParts = namespace.split("_");

        let libraryNamespace = "CABLES";
        if (namespaceParts.length > 1)
        {
            libraryNamespace = "";
            namespaceParts.pop();
            namespaceParts.forEach((part, i) =>
            {
                if (i > 0) libraryNamespace += ".";
                libraryNamespace += part.toUpperCase();
            });
        }

        console.log("NAMESPACE", namespace, namespaceEntryFile, namespaceParts, libraryNamespace);

        outputs.push(
            {
                "entry": {
                    "main": {
                        "import": path.join(__dirname, "src", "libs", namespace, namespaceEntryFile),
                        "filename": namespace + ".js"
                    }
                },
                "output": {
                    "path": path.join(__dirname, "build", "libs"),
                    "library": {
                        "name": libraryNamespace.toUpperCase(),
                        "type": "assign-properties"
                    }
                }
            }
        );

        return outputs;
    };

    const readLibraryFiles = () =>
    {
        const LIBDIR_ENTRIES = fs.readdirSync(path.join(__dirname, "src", "libs"), { "withFileTypes": true });
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
            "cables-shared-client": "CABLES.SHARED",
            "gl-matrix": "CABLES.GLMatrix"
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
