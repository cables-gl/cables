import path, { dirname } from "path";
import glMatrix from "gl-matrix";
import webpack from "webpack";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";

export default (isLiveBuild, buildInfo, minify = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return {
        "mode": isLiveBuild ? "production" : "development",
        "entry": [
            path.join(__dirname, "src", "core", "index.js")
        ],
        "devtool": minify ? "source-map" : false,
        "output": {
            "path": path.join(__dirname, "build"),
            "filename": "cables.js",
            "library": "CABLES",
            "libraryExport": "default",
            "libraryTarget": "var",
            "globalObject": "window"
        },
        "optimization": {
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
                    "use": "raw-loader"
                },
                {
                    "test": /\.vert/,
                    "use": "raw-loader"
                },
                {
                    "test": /\.wgsl/,
                    "use": "raw-loader"
                }
            ].filter(Boolean)
        },
        "externals": ["CABLES.UI", ...Object.keys(glMatrix), "gl-matrix"],
        "resolve": {
            "extensions": [".json", ".js", ".jsx"]
        },
        "plugins": [
            new webpack.BannerPlugin({
                "entryOnly": true,
                "footer": true,
                "raw": true,
                "banner": "\n\nvar CABLES = CABLES || {}; CABLES.build = " + JSON.stringify(buildInfo) + ";"
            })
        ]
    };
};
