const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const webpackConfig = require("./webpack.config");

exports.default = exports.watch = gulp.series(gulp.parallel(taskCoreLibs, taskCoreJsMax, taskCoreJsMin), _watch);

exports.build = gulp.parallel(taskCoreLibs, taskCoreJsMax, taskCoreJsMin);

function _watch()
{
    gulp.watch("src/core/**/*", gulp.parallel(taskCoreJsMax, taskCoreJsMin));
    gulp.watch("libs/**/*", gulp.parallel(taskCoreLibs));
}

function taskCoreLibs()
{
    return (
        gulp
            .src(["libs/*.js"])
            // .pipe(sourcemaps.init())
            .pipe(concat("libs.core.js"))
            .pipe(gulp.dest("build"))
            .pipe(rename("libs.core.min.js"))
            // .pipe(uglify())
            // .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest("build"))
    );
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
