const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");

exports.default = exports.watch = gulp.series(_scripts_core, _watch);

exports.build = gulp.series(_scripts_core);

function _watch()
{
    gulp.watch("src/core/**/*", gulp.series(_scripts_core));

    // cb();
}

// function _scripts_libs_core()
// {
//     return gulp.src(['libs/core/*.js'])
//         .pipe(sourcemaps.init())
//         .pipe(concat('libs.core.js'))
//         .pipe(gulp.dest('dist/js'))
//         .pipe(rename('libs.core.min.js'))
//         .pipe(uglify())
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('dist/js'));
// }

function _scripts_core()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/index.js"])
            .pipe(
                webpack(
                    {
                        config: require("./webpack.config.js"),
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

            .pipe(gulp.dest("../cables_ui/dist/js"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}
