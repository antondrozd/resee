'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var server = require('browser-sync').create();
var run = require('run-sequence');
var del = require('del');
var jade = require('gulp-jade');

gulp.task('jade', function() {
  gulp.src('**/*.jade')
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

gulp.task('style', function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 2 versions'
      ]})
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

// gulp.task('symbols', function() {
//   return gulp.src('build/img/icons/*.svg')
//     .pipe(svgmin())
//     .pipe(svgstore({
//       inlineSvg: true
//     }))
//     .pipe(rename('symbols.svg'))
//     .pipe(gulp.dest('build/img'));
// });

gulp.task('images', function() {
  return gulp.src('build/img/**/*.{png,jpg,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('serve', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('*.jade', ['jade']);
  gulp.watch('js/**/*.js', ['js:update']);
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/**',
    'js/**'
    ], {
      base: '.'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('js:copy', function () {
  return gulp.src('js/**/*.js')
    .pipe(gulp.dest('build/js'));
});

gulp.task('js:update', ['js:copy'], function(done) {
  server.reload();
  done();
});

gulp.task('build', function(fn) {
  run(
    'clean',
    'copy',
    'jade',
    'style',
    'images',
    // 'symbols',
    fn
  );
});
