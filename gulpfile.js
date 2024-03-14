//
import gulp from "gulp";

import footer from "gulp-footer";
import fs from "fs";
import getRepoInfo from "git-repo-info";
import clean from "gulp-clean";
import rename from "gulp-rename";
import concat from "gulp-concat";
import compiler from "webpack";
import webpack from "webpack-stream";

import webpackConfig from "./webpack.config.js";
import libWebpackConfig from "./webpack.config.libs.js";

let buildInfo = getBuildInfo();

function getBuildInfo()
{
    const git = getRepoInfo();
    const date = new Date();
    return {
        "timestamp": date.getTime(),
        "created": date.toISOString(),
        "git": {
            "branch": git.branch,
            "commit": git.sha,
            "date": git.committerDate,
            "message": git.commitMessage
        }
    };
}

function _update_buildInfo(done)
{
    buildInfo = getBuildInfo();
    fs.mkdir("build/", { "recursive": true }, (err) =>
    {
        if (err)
        {
            return console.error(err);
        }
        fs.writeFileSync("build/buildInfo.json", JSON.stringify(buildInfo));
        done();
    });
}

function _append_build_info()
{
    return gulp
        .src(["build/*.js"])
        .pipe(footer("\n\nvar CABLES = CABLES || {}; CABLES.build = " + JSON.stringify(buildInfo) + ";"))
        .pipe(gulp.dest("build/"));
}

function _watch(done)
{
    gulp.watch(["src/core/**/*", "../shared/client/**/*"], { "usePolling": true }, gulp.series(_update_buildInfo, gulp.parallel(_corejs_max), gulp.parallel(_core_libs_max), _append_build_info, _copy_ui, _core_libs_copy));
    gulp.watch("libs/**/*", { "usePolling": true }, gulp.series(_update_buildInfo, _external_libs, _append_build_info, _copy_ui));
    gulp.watch("src/libs/**/*", { "usePolling": true }, gulp.series(_update_buildInfo, _core_libs_clean, gulp.parallel(_core_libs_max), _append_build_info, _core_libs_copy));
    done();
}

function _core_libs_clean()
{
    return gulp.src("build/libs/*", { "read": false }).pipe(clean());
}

function _copy_ui()
{
    return gulp.src(["build/*", "!build/buildInfo.json", "!/build/libs/*"]).pipe(gulp.dest("../cables_ui/dist/js/"));
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
            .pipe(concat("libs.core.js"))
            .pipe(gulp.dest("build"))
            .pipe(rename("libs.core.min.js"))
            .pipe(gulp.dest("build"))
    );
}

function _corejs_max(done)
{
    return gulp.src(["src/core/index.js"])
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
                        done(new Error(stats.compilation.errors.join("\n")));
                    }
                    done();
                }
            )
        )
        .pipe(gulp.dest("build"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

function _corejs_min(done)
{
    return gulp.src(["src/core/index.js"])
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
                        done(new Error(stats.compilation.errors.join("\n")));
                    }
                    done();
                }
            )
        )

        .pipe(gulp.dest("build"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

function _core_libs_max(done)
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
                        done(Error(stats.compilation.errors.join("\n")));
                    }
                    done();
                }
            )
        )
        .pipe(gulp.dest("build/libs"))
        .on("error", (err) =>
        {
            console.error("WEBPACK ERROR", err);
        });
}

function _core_libs_min()
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
    _update_buildInfo,
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min
    ),
    _core_libs_clean,
    gulp.parallel(
        _core_libs_max,
        _core_libs_min
    ),
    _append_build_info,
    _copy_ui,
    _core_libs_copy,
    _watch
));

gulp.task("watch", gulp.series(
    _update_buildInfo,
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min
    ),
    _core_libs_clean,
    gulp.parallel(
        _core_libs_max,
        _core_libs_min
    ),
    _append_build_info,
    _copy_ui,
    _core_libs_copy,
    _watch
));

gulp.task("build", gulp.series(
    _update_buildInfo,
    gulp.parallel(
        _external_libs,
        _corejs_max,
        _corejs_min
    ),
    _core_libs_clean,
    gulp.parallel(
        _core_libs_max,
        _core_libs_min
    ),
    _append_build_info,
    _copy_ui,
    _core_libs_copy
));
