const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const clean = require("gulp-clean");
const webpackConfig = require("./webpack.config");
const libWebpackConfig = require("./webpack.config.libs");


function _watch()
{
    gulp.watch("src/core/**/*", gulp.parallel(_corejs_max, _corejs_min));
    gulp.watch("libs/**/*", gulp.parallel(_external_libs));
    gulp.watch("src/libs/**/*", gulp.series(_core_libs_clean, gulp.parallel(_corelibsjs_max, _corelibsjs_min), _core_libs_copy));
}

function _core_libs_clean()
{
    return gulp.src("build/libs/*", { "read": false }).pipe(clean());
}

function _core_libs_copy()
{
    return gulp.src("build/libs/*.js").pipe(gulp.dest("../cables_api/public/libs_core/"));
}

function _external_libs()
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

function _corejs_max()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, false),
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
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function _corejs_max_babel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, true),
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
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function _corejs_min()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, false),
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
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function _corejs_min_babel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, true),
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
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function _corelibsjs_max()
{
    return gulp.src(["src/libs/**/*"])
        .pipe(
            webpack(
                {
                    "config": libWebpackConfig(false),
                },
                compiler,
                (err, stats) =>
                {
                    if (err) throw err;
                    if (stats.hasErrors())
                    {
                        return new Error(stats.compilation.errors.join("\n"));
                    }
                }
            )
        )
        .pipe(gulp.dest("build/libs"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

function _corelibsjs_min()
{
    return gulp.src(["src/libs/**/*"])
        .pipe(
            webpack(
                {
                    "config": libWebpackConfig(true),
                },
                compiler,
                (err, stats) =>
                {
                    if (err) throw err;
                    if (stats.hasErrors())
                    {
                        return new Error(stats.compilation.errors.join("\n"));
                    }
                }
            )
        )
        .pipe(gulp.dest("build/libs"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

/*
 * -------------------------------------------------------------------------------------------
 * MAIN TASKS
 * -------------------------------------------------------------------------------------------
 */

gulp.task("default", gulp.series(
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min,
        _corejs_max_babel,
        _corejs_min_babel
    ),
    _core_libs_clean,
    gulp.parallel(
        _corelibsjs_max,
        _corelibsjs_min
    ),
    _core_libs_copy,
    _watch
));

gulp.task("watch", gulp.series(
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min,
        _corejs_max_babel,
        _corejs_min_babel
    ),
    _core_libs_clean,
    gulp.parallel(
        _corelibsjs_max,
        _corelibsjs_min
    ),
    _core_libs_copy,
    _watch
));

gulp.task("build", gulp.series(
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min,
        _corejs_max_babel,
        _corejs_min_babel
    ),
    _core_libs_clean,
    gulp.parallel(
        _corelibsjs_max,
        _corelibsjs_min
    ),
    _core_libs_copy
));
