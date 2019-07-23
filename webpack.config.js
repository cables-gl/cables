const path = require("path");
const fs = require("fs");
const glob = require("glob");
const webpack = require("webpack");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");

module.exports = {
    mode: "production",
    entry: [
        path.join(__dirname, "src", "index.js"),
        // ...fs.readdirSync('./src/ops/').filter(file => file.match(/.*\.js$/)),
    ],
    // watch: true,
    output: {
        path: path.join(process.cwd(), "dist"),
        // publicPath: `${__dirname}dist/`,
        filename: "cables.max.js",
        // chunkFilename: '[name].js',
        library: "CABLES",
        libraryExport: "default",
        libraryTarget: "var",
        globalObject: "window",
    },
    optimization: { minimize: false },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                include: [path.resolve(__dirname, "src")],
                exclude: [path.resolve(__dirname, "node_modules")],
                loader: "babel-loader",
                query: {
                    presets: [
                        [
                            "@babel/env",
                            {
                                targets: {
                                    edge: "12",
                                    ie: "11",
                                    safari: "10",
                                },
                            },
                        ],
                    ],
                    plugins: ["transform-object-rest-spread"],
                },
            },
        ],
    },
    externals: ["CABLES.UI"],
    resolve: {
        extensions: [".json", ".js", ".jsx"],
        // alias: {
        //     CGL: path.resolve(__dirname, "./src/core/cgl/index.js"),
        // },
    },
    // devtool: "cheap-module-source-map",
    plugins: [
        // new webpack.ProvidePlugin({
        //     CGL: "CGL",
        // }),
        // new ErrorOverlayPlugin()
    ],
};
