import path from "path";
import glMatrix from "gl-matrix";
import TerserPlugin from "terser-webpack-plugin";

export default (isProduction, minify = false) =>
{
    const __dirname = new URL(".", import.meta.url).pathname;
    return {
        "mode": isProduction ? "production" : "development",
        "entry": [
            path.join(__dirname, "src", "core", "index.js"),
        ],
        "devtool": minify ? "source-map" : false,
        "output": {
            "path": path.join(__dirname, "build"),
            "filename": "cables.js",
            "library": "CABLES",
            "libraryExport": "default",
            "libraryTarget": "var",
            "globalObject": "window",
        },
        "optimization": {
            "minimizer": [new TerserPlugin({ "extractComments": false, "terserOptions": { "output": { "comments": false } } })],
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
        "externals": ["CABLES.UI", ...Object.keys(glMatrix), "gl-matrix"],
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
        }
    };
};
