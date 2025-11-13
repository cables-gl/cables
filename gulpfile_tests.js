import gulp from "gulp";
import jsonSchema from "gulp-json-schema";

function _validateOpDocs()
{
    return gulp.src("src/ops/base/**/*.json").pipe(jsonSchema("op.schema.json"));
}

const defaultSeries = gulp.series(
    _validateOpDocs
);

gulp.task("validate:opdocs", gulp.series(
    _validateOpDocs
));

gulp.task("default", gulp.series(
    defaultSeries,
));
