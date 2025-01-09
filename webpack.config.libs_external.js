import path, { dirname } from "path";
import TerserPlugin from "terser-webpack-plugin";
import { fileURLToPath } from "url";
import ModuleScopePlugin from "@k88/module-scope-plugin";

export default (isLiveBuild, buildInfo, minify = false, analyze = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const config = {
        "mode": isLiveBuild ? "production" : "development",
        "entry": [
            path.join(__dirname, "libs", "index.js")
        ],
        "devtool": minify ? "source-map" : false,
        "output": {
            "path": path.join(__dirname, "build"),
            "filename": "libs.core.js"
        },
        "optimization": {
            "concatenateModules": true,
            "minimizer": [new TerserPlugin({
                "extractComments": false,
                "terserOptions": { "output": { "comments": false } }
            })],
            "minimize": minify,
            "usedExports": true
        },
        "resolve": {
            "extensions": [".js"],
            "plugins": [
                new ModuleScopePlugin.default("libs/"),
            ],
        }
    };
    return config;
};
