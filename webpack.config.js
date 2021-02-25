const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const glMatrix = require("gl-matrix");

const glMatrixClasses = ["glMatrix", "mat2", "mat2d", "mat3", "mat4", "quat", "quat2", "vec2", "vec3", "vec4"];

module.exports = (isProduction, shouldBabel = false) => ({
    "mode": isProduction ? "production" : "development",
    "entry": [
        path.join(__dirname, "src", "core", "index.js"),
    ],
    "devtool": isProduction ? "source-map" : "cheap-module-eval-source-map",
    "output": {
        "path": path.join(__dirname, "build"),
        "filename": isProduction ?
            (shouldBabel ? "babel.cables.min.js" : "cables.min.js")
            : (shouldBabel ? "babel.cables.max.js" : "cables.max.js"),
        "library": "CABLES",
        "libraryExport": "default",
        "libraryTarget": "var",
        "globalObject": "window",
    },
    "stats": isProduction,
    "optimization": { "minimize": isProduction },
    "module": {
        "rules": [
            shouldBabel && {
                "test": /.jsx?$/,
                "include": [path.resolve(__dirname, "src")],
                "exclude": [path.resolve(__dirname, "node_modules")],
                "loader": "babel-loader",
                "query": {
                    "presets": [
                        [
                            "@babel/env",
                            {
                                "targets": {
                                    "edge": "12",
                                    "ie": "11",
                                    "safari": "10",
                                },
                            },
                        ],
                    ],
                    "plugins": ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-object-assign"],

                },
            },
        ].filter(Boolean),
    },
    "externals": ["CABLES.UI", ...Object.keys(glMatrix), "gl-matrix"],
    "resolve": {
        "extensions": [".json", ".js", ".jsx"],
    },
    "plugins": [
        isProduction
            && new BundleAnalyzerPlugin({
                "analyzerMode": "disabled",
                "generateStatsFile": true,
            })
    ].filter(Boolean),
});
