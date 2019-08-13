const path = require("path");
const webpack = require("webpack");
// const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const glMatrix = require("gl-matrix");

console.log("GLMATRIX", Object.keys(glMatrix));

const glMatrixClasses = ["glMatrix", "mat2", "mat2d", "mat3", "mat4", "quat", "quat2", "vec2", "vec3", "vec4"];

const provideObject = glMatrixClasses.reduce((acc, val) =>
{
    acc[val] = ["gl-matrix", val];
    return acc;
}, {});

console.log("PROID", provideObject)
module.exports = isProduction => ({
    mode: isProduction ? "production" : "development",
    entry: [
        path.join(__dirname, "src", "core", "index.js"),
        // ...fs.readdirSync('./src/ops/').filter(file => file.match(/.*\.js$/)),
    ],
    // watch: true,
    devtool: isProduction ? "source-map" : "cheap-module-eval-source-map",
    output: {
        path: path.join(__dirname, "build"),
        // publicPath: `${__dirname}dist/`,
        filename: isProduction ? "cables.min.js" : "cables.max.js",
        // chunkFilename: '[name].js',
        library: "CABLES",
        libraryExport: "default",
        libraryTarget: "var",
        globalObject: "window",
    },
    stats: isProduction,
    optimization: { minimize: isProduction },
    module: {
        rules: [
            // {
            //     test: /.jsx?$/,
            //     include: [path.resolve(__dirname, "src")],
            //     exclude: [path.resolve(__dirname, "node_modules")],
            //     loader: "babel-loader",
            //     query: {
            //         presets: [
            //             [
            //                 "@babel/env",
            //                 {
            //                     targets: {
            //                         edge: "12",
            //                         ie: "11",
            //                         safari: "10",
            //                     },
            //                 },
            //             ],
            //         ],
            //         plugins: ["@babel/plugin-proposal-object-rest-spread"],
            //     },
            // },
        ],
    },
    externals: ["CABLES.UI", ...Object.keys(glMatrix), "gl-matrix"],
    resolve: {
        extensions: [".json", ".js", ".jsx"],
        // alias: {
        //     CGL: path.resolve(__dirname, "./src/core/cgl/index.js"),
        // },
    },
    // devtool: "cheap-module-source-map",
    plugins: [
        isProduction
            && new BundleAnalyzerPlugin({
                analyzerMode: "disabled",
                generateStatsFile: true,
            }),
        // new webpack.ProvidePlugin(provideObject),
        // new webpack.ProvidePlugin({
        //     CGL: "CGL",
        // }),
        // new ErrorOverlayPlugin()
    ].filter(Boolean),
});
