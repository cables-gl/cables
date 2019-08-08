const path = require("path");
const webpack = require("webpack");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const glMatrix = require("gl-matrix");

const provideObject = Object.keys(glMatrix).reduce((acc, val) =>
{
    acc[val] = ["gl-matrix", val];
    return acc;
}, {});

module.exports = isProduction =>
    ({
        mode: isProduction ? "production" : "development",
        entry: [
            path.join(__dirname, "src", "index.js"),
            // ...fs.readdirSync('./src/ops/').filter(file => file.match(/.*\.js$/)),
        ],
        // watch: true,
        devtool: isProduction ? "source-map" : "cheap-module-eval-source-map",
        output: {
            path: path.join(process.cwd(), "dist"),
            // publicPath: `${__dirname}dist/`,
            filename: isProduction ? "cables.min.js" : "cables.max.js",
            // chunkFilename: '[name].js',
            library: "CABLES",
            libraryExport: "default",
            libraryTarget: "var",
            globalObject: "window",
        },
        optimization: { minimize: isProduction },
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
                        plugins: ["@babel/plugin-proposal-object-rest-spread"],
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
            new webpack.ProvidePlugin(provideObject),
            // new webpack.ProvidePlugin({
            //     CGL: "CGL",
            // }),
            // new ErrorOverlayPlugin()
        ],
    });
