//
import gulp from "gulp";

import fs from "fs";
import git from "git-last-commit";
import webpack from "webpack";

import path from "path";
import { BuildWatcher } from "cables-shared-client";
import jsonSchema from "gulp-json-schema";
import webpackConfig from "./webpack.config.js";
import webpackLibsConfig from "./webpack.config.corelibs.js";

let configLocation = path.join("..", "gen", "cables.json");
if (process.env.npm_config_apiconfig) configLocation = path.join("..", "gen", "cables_env_" + process.env.npm_config_apiconfig + ".json");

let isLiveBuild = false;
let minify = false;
let analyze = false;

let config = {};
if (fs.existsSync(configLocation))
{
    config = JSON.parse(fs.readFileSync(configLocation, "utf-8"));
    isLiveBuild = config.env === "live";
    minify = config.hasOwnProperty("minifyJs") ? config.minifyJs : false;
}
if (!config.path) config.path = {};
if (!config.path.corelibs) config.path.corelibs = "../public/js/libs_core/";

function getBuildInfo(cb)
{
    const date = new Date();
    git.getLastCommit((err, commit) =>
    {
        const buildInfo = {
            "timestamp": date.getTime(),
            "created": date.toISOString(),
            "git": {
                "branch": commit.branch,
                "commit": commit.hash,
                "date": commit.committedOn,
                "message": commit.subject
            }
        };
        fs.writeFile("build/buildinfo.json", JSON.stringify(buildInfo), () =>
        {
            cb(buildInfo);
        });
    });
}

function getWebpackErrorMessage(stats)
{
    let errorMessage = stats.compilation.errors.join("\n");
    const errorsWarnings = stats.toJson("errors-warnings");
    if (errorsWarnings && errorsWarnings.errors)
    {
        const modules = errorsWarnings.errors.filter((e) => { return !!e.moduleIdentifier; });
        if (modules && modules.length > 0)
        {
            modules.forEach((m) =>
            {
                const parts = m.moduleIdentifier.split("|");
                const filename = parts.length > 0 ? parts[1] : m.moduleIdentifier;
                const em = m.message.split("\n");
                errorMessage = filename + ":" + m.loc + " - " + em[0] || m.message;
            });
        }
    }
    return errorMessage;
}

function _watch(done)
{
    const buildWatcher = new BuildWatcher(gulp, config, "core");
    const watchOptions = { "ignored": (file) => { return file.includes("/node_modules/"); } };
    gulp.watch(["src/core/**/*", "../shared/shared_constants.json", "../shared/client/**/*.js"], watchOptions, gulp.series(gulp.parallel(_core_js), gulp.parallel(_core_libs), _copy_ui, _core_libs_copy));
    gulp.watch("src/corelibs/**/*", watchOptions, gulp.series(_core_libs_clean, gulp.parallel(_core_libs), _core_js, _copy_ui, _core_libs_copy));
    if (config.watchOps) buildWatcher.notify(["src/ops/**/*.js"], watchOptions, "opchange");
    if (config.watchOps) buildWatcher.notify(["src/ops/**/att_*"], watchOptions, "attachmentchange");

    done();
}

function _analyze(done)
{
    analyze = true;
    done();
}

function _core_libs_clean(done)
{
    const dir = "build/corelibs/";
    if (fs.existsSync(dir)) fs.rmSync(dir, { "recursive": true });
    done();
}

function _copy_ui()
{
    return gulp.src(["build/*", "!build/buildinfo.json", "!/build/corelibs/*", "!build/report_*.html"]).pipe(gulp.dest("../cables_ui/dist/js/"));
}

function _core_libs_copy(done)
{
    const source = "build/corelibs/";
    const target = path.join("../cables_api/src/", config.path.corelibs);

    if (!process.env.cables_electron || process.env.cables_electron === "false")
    {
        if (!fs.existsSync(target)) fs.mkdirSync(target, { "recursive": true });
        if (!fs.existsSync(source)) fs.mkdirSync(source, { "recursive": true });
        return gulp.src(source + "*.js").pipe(gulp.dest(target));
    }
    else
    {
        done();
    }
}

function _core_js(done)
{
    getBuildInfo((buildInfo) =>
    {
        webpack(webpackConfig(isLiveBuild, buildInfo, minify, analyze, config.sourceMap), (err, stats) =>
        {
            if (err) throw err;
            if (stats.hasErrors())
            {
                done(new Error(getWebpackErrorMessage(stats)));
            }
            done();
        });
    });
}

function _core_libs(done)
{
    getBuildInfo((buildInfo) =>
    {
        webpack(webpackLibsConfig(isLiveBuild, buildInfo, false, false, config.sourceMap),
            (err, multiStats) =>
            {
                if (err) throw err;
                if (multiStats && multiStats.hasErrors())
                {
                    const allErrors = [];
                    multiStats.stats.forEach((stat) =>
                    {
                        if (stat.hasErrors() && stat.compilation && stat.compilation.errors)
                        {
                            allErrors.push(getWebpackErrorMessage(stat));
                        }
                    });
                    done(Error(allErrors.join("\n\n")));
                }
                else
                {
                    done();
                }
            }
        );
    });
}

function _validateOpDocs(done)
{
    return gulp.src("src/ops/base/**/*.json").pipe(jsonSchema("op.schema.json"));
}

/*
 * -------------------------------------------------------------------------------------------
 * MAIN TASKS
 * -------------------------------------------------------------------------------------------
 */

const defaultSeries = gulp.series(
    _core_js,
    _core_libs_clean,
    _core_libs,
    _copy_ui,
    _core_libs_copy
);

gulp.task("build", defaultSeries);

gulp.task("analyze", gulp.series(
    _analyze,
    defaultSeries,
));

gulp.task("default", gulp.series(
    defaultSeries,
    _watch
));

gulp.task("watch", gulp.series(
    defaultSeries,
    _watch
));

gulp.task("validate:opdocs", gulp.series(
    _validateOpDocs
));
