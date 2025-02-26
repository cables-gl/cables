import path, { dirname } from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import ModuleScopePlugin from "@k88/module-scope-plugin";

export default (isLiveBuild, buildInfo, minify = false, analyze = false) =>
{
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const plugins = [
        new webpack.BannerPlugin({
            "entryOnly": true,
            "footer": true,
            "raw": true,
            "banner": "\n\nvar CABLES = CABLES || {}; CABLES.build = " + JSON.stringify(buildInfo) + ";"
        })
    ];
    if (analyze)
    {
        plugins.push(new BundleAnalyzerPlugin({ "analyzerMode": "static", "openAnalyzer": false, "reportTitle": "cables core", "reportFilename": path.join(__dirname, "build", "report_core.html") }));
    }
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
        "externals": ["CABLES.UI"],
        "resolve": {
            "extensions": [".json", ".js", ".jsx"],
            "plugins": [
                new ModuleScopePlugin.default("src/core/"),
            ],
        },
        "plugins": plugins
    };
};
