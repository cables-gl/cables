import path, { dirname } from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import { fileURLToPath } from "url";
import glMatrix from "gl-matrix";
import webpack from "webpack";

export default (isLiveBuild, buildInfo, minify = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return {
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
            "minimizer": [new TerserPlugin({
                "extractComments": false,
                "terserOptions": { "output": { "comments": false } }
            })],
            "minimize": minify,
            "usedExports": true
        },
        "resolve": {
            "extensions": [".js"]
        }
    };
};
