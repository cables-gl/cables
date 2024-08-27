const gulp = require('gulp');
const path = require('path');
const browserify = require('browserify');
const babel = require('gulp-babel');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const uglify = require('uglify-es');
const uglifyComposer = require('gulp-uglify/composer');
const minify = uglifyComposer(uglify, console);
const convertNewline = require('gulp-convert-newline');

const DIST = './';
const VERSION = require('./package.json').version;

const FULL_HEADER = (
  '/**\n' +
  ' * AsyncStreamEmitter v' + VERSION + ' browser bundle\n' +
  ' */\n '
);

const FULL_FOOTER = (
  '\n' +
  'export default AsyncStreamEmitter;' +
  '\n'
);

gulp.task('browserify', (done) => {
  let stream = browserify({
      builtins: [],
      entries: 'index.js',
      standalone: 'AsyncStreamEmitter'
    })
    .ignore('_process')
    .require('./index.js', {expose: 'async-stream-emitter'})
    .bundle();
  return stream.pipe(source('async-stream-emitter.js'))
    .pipe(insert.prepend(FULL_HEADER))
    .pipe(insert.append(FULL_FOOTER))
    .pipe(convertNewline({
      newline: 'lf',
      encoding: 'utf8'
    }))
    .pipe(gulp.dest(DIST));
});

gulp.task('minify', () => {
  return gulp.src(DIST + 'async-stream-emitter.js')
    .pipe(babel({
      comments: false
    }))
    .pipe(babel({
      plugins: ['minify-dead-code-elimination']
    }))
    .pipe(minify())
    .pipe(insert.prepend(FULL_HEADER))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest(DIST));
});
