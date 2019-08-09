const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const webpackConfig = require("./webpack.config");

exports.default = exports.watch = gulp.series(gulp.parallel(taskCoreJsMax, taskCoreJsMin), _watch);

exports.build = gulp.parallel(taskCoreJsMax, taskCoreJsMin);

function _watch()
{
    gulp.watch("src/core/**/*", gulp.parallel(taskCoreJsMax, taskCoreJsMin));
}

function taskCoreJsMax()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/index.js"])
            .pipe(
                webpack(
                    {
                        config: webpackConfig(false),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    },
                ),
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMin()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/index.js"])
            .pipe(
                webpack(
                    {
                        config: webpackConfig(true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    },
                ),
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}
