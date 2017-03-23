var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var gulp_sync_task = require('gulp-sync-task');
var rename = require("gulp-rename");
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var uglyfly = require('gulp-uglyfly');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var injectHtml = require('gulp-inject-stringified-html');
var replace = require('gulp-just-replace');

var APP_JS = 'bi.js';
var APP_CSS = 'bi.css';
var LIBS_JS = 'libs.js';
var LIBS_CSS = 'libs.css';

var APP_DEST = './dist/';
var FONTS_DEST = APP_DEST + '/fonts';
var LIBS_DEST = APP_DEST + '/libs';
var CSS_DEST = APP_DEST + '/css';

var rep = [
    {
        search: /(%__\(\\')/g,
        replacement: '" + __("'
    },
    {
        search: /(\\'\)__%)/g,
        replacement: '") + "'
    }
];

var SOURCE_FILES = [
    './js/dashboard.js',
    './js/bi-value.js',
    './js/filter.js',
    './js/aggregatePanel.js',
    './js/filterPanel.js',
    './js/export.js',
    './js/dialogs.js'
];

var LANGUAGE_FILES = [
    './translations/ru.json'
];

var APP_CSS_FILES = [
    './css/bi.css'
];

var FONTS_FILES = [
    './node_modules/bootstrap/dist/fonts/**',
    './node_modules/font-awesome/fonts/**'
];

var LIBS_FILES = [
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.js',
    './node_modules/moment/moment.js',
    './node_modules/moment/locale/ru.js',
    './node_modules/jquery-deparam/jquery-deparam.js',
    './node_modules/crossfilter/crossfilter.js',
    './node_modules/d3/d3.js',
    './js/lib/pikaday.js',
    './node_modules/pikaday-time/plugins/pikaday.jquery.js',
    './node_modules/dc/dc.js',
    './node_modules/file-saver/FileSaver.js',
    './node_modules/select2/dist/js/select2.js',
    './node_modules/bootstrap-checkbox/dist/js/bootstrap-checkbox.js',
    './node_modules/jquery-mask-plugin/dist/jquery.mask.js',
    './node_modules/gijgo-modular/tree/js/tree.js',
    './node_modules/bootstrap-table/dist/bootstrap-table.js',
    './node_modules/bootstrap-dialog/dist/js/bootstrap-dialog.js'
];

var CSS_FILES = [
    './node_modules/font-awesome/css/font-awesome.css',
    './node_modules/pikaday-time/css/pikaday.css',
    './node_modules/dc/dc.css',
    './node_modules/select2/dist/css/select2.css',
    './node_modules/gijgo-modular/tree/css/tree.css',
    './node_modules/bootstrap-table/dist/bootstrap-table.css'
];

gulp.task('clean', function() {
    return gulp.src(APP_DEST, {read: false})
    .pipe(clean());
});

gulp.task('app.scrips.dev', function() {
    return gulp.src(SOURCE_FILES)
    .pipe(injectHtml())
    .pipe(replace(rep))
    .pipe(concat(APP_JS))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('index-dev.copy', function() {
    return gulp.src('index-dev.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('translations.copy', function() {
    return gulp.src(LANGUAGE_FILES)
    .pipe(gulp.dest(APP_DEST + '/translations'))
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

gulp.task('app.css.dev', ['build.sass'], function() {
    return gulp.src(APP_CSS_FILES)
    .pipe(concat(APP_CSS))
    .pipe(gulp.dest(CSS_DEST))
});

gulp.task('watch', function() {
    watch(['js/*.js', 'sass/*.scss', 'index-dev.html', 'index.html'], batch(function(events, done) {
        gulp.start('index-stage.copy', done);
        gulp.start('app.scrips.dev', done);
        gulp.start('app.css.dev', done);
    }));
});

gulp.task('build.sass', function() {
    return gulp.src('./sass/bi.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('build.dev', ['clean'], gulp_sync_task(
    'fonts',
    'index-stage.copy',
    'translations.copy',
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
    .pipe(injectHtml())
    .pipe(replace(rep))
    .pipe(concat(APP_JS))
    .pipe(uglyfly())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(APP_DEST))
});

gulp.task('app.css.prod', ['build.sass'], function() {
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
    'translations.copy',
    'app.scripts.prod',
    'lib.scrips.prod',
    'lib.css.prod',
    'app.css.prod'
    )
);