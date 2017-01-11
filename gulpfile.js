var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var gulp_sync_task = require('gulp-sync-task');
var gulpCopy = require('gulp-copy');
var rename = require("gulp-rename");
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var uglyfly = require('gulp-uglyfly');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');

var APP_JS = 'bi.js';
var APP_CSS = 'bi.css';
var LIBS_JS = 'libs.js';
var LIBS_CSS = 'libs.css';

var APP_DEST = './dist/';
var FONTS_DEST = APP_DEST + '/fonts';
var LIBS_DEST = APP_DEST + '/libs';
var CSS_DEST = APP_DEST + '/css';


var SOURCE_FILES = [
    './js/dashboard.js',
    './js/filter.js'
];

var APP_CSS_FILES = [
    './css/bi.css',
    './css/pikaday-theme.css'
];

var FONTS_FILES = [
    './node_modules/bootstrap/dist/fonts/**',
    './node_modules/font-awesome/fonts/**'
];

var LIBS_FILES = [
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.js',
    // './node_modules/moment/moment.js',
    // './node_modules/moment/locale/ru.js',
    // './node_modules/holderjs/holder.js',
    './node_modules/jquery-deparam/jquery-deparam.js',
    './node_modules/crossfilter/crossfilter.js',
    './node_modules/d3/d3.js',
    './node_modules/pikaday/pikaday.js',
    './node_modules/dc/dc.js',
    './node_modules/file-saver/FileSaver.js'
];

var CSS_FILES = [
    './node_modules/font-awesome/css/font-awesome.css',
    './node_modules/bootstrap/dist/css/bootstrap.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.css',
    './node_modules/pikaday/css/pikaday.css',
    './node_modules/dc/dc.css'
];

gulp.task('clean', function() {
    return gulp.src(APP_DEST, {read: false})
    .pipe(clean());
});

gulp.task('app.scrips.dev', function() {
    return gulp.src(SOURCE_FILES)
    .pipe(concat(APP_JS))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('index-dev.copy', function() {
    return gulp.src('index-dev.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('index-stage.copy', function() {
    return gulp.src('index.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('fonts', function() {
    return gulp.src(FONTS_FILES)
    .pipe(gulp.dest(FONTS_DEST))
});

gulp.task('lib.scrips.dev', function() {
    return gulp.src(LIBS_FILES)
    .pipe(concat(LIBS_JS))
    .pipe(gulp.dest(LIBS_DEST))
});

gulp.task('lib.css.dev', function() {
    return gulp.src(CSS_FILES)
    .pipe(concat(LIBS_CSS))
    .pipe(gulp.dest(CSS_DEST))
});

gulp.task('app.css.dev', function() {
    return gulp.src(APP_CSS_FILES)
    .pipe(concat(APP_CSS))
    .pipe(gulp.dest(CSS_DEST))
});

gulp.task('watch', function() {
    watch(['js/*.js', 'css/*.css', 'index-dev.html', 'index.html'], batch(function(events, done) {
        gulp.start('index-stage.copy', done);
        gulp.start('app.scrips.dev', done);
        gulp.start('app.css.dev', done);
    }));
});

gulp.task('build.dev', ['clean'], gulp_sync_task(
    'fonts',
    'index-stage.copy',
    'app.scrips.dev',
    'lib.scrips.dev',
    'lib.css.dev',
    'app.css.dev'
    )
);

// prod
gulp.task('app.scripts.prod', function() {
    return gulp.src(SOURCE_FILES)
    .pipe(sourcemaps.init())
    .pipe(concat(APP_JS))
    .pipe(uglyfly())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('app.css.prod', function() {
    return gulp.src(APP_CSS_FILES)
    .pipe(concat(APP_CSS))
    .pipe(cssnano())
    .pipe(gulp.dest(CSS_DEST))
});

gulp.task('lib.scrips.prod', function() {
    return gulp.src(LIBS_FILES)
    .pipe(concat(LIBS_JS))
    .pipe(uglyfly())
    .pipe(gulp.dest(LIBS_DEST))
});

gulp.task('lib.css.prod', function() {
    return gulp.src(CSS_FILES)
    .pipe(concat(LIBS_CSS))
    .pipe(cssnano())
    .pipe(gulp.dest(CSS_DEST))
});

gulp.task('build.prod', ['clean'], gulp_sync_task(
    'fonts',
    'index-stage.copy',
    'app.scripts.prod',
    'lib.scrips.prod',
    'lib.css.prod',
    'app.css.prod'
    )
);