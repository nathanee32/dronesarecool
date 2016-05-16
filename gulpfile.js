require('es6-promise').polyfill();
var gulp    = require('gulp'),
    sass    = require('gulp-sass'),
    prefix  = require('gulp-autoprefixer'),
    spawn   = require('child_process').spawn,
    uglify  = require('gulp-uglify'),
    concat  = require('gulp-concat'),
    cssmin  = require('gulp-minify-css'),
    htmlmin = require('gulp-minify-html'),
    gutil   = require('gulp-util'),
    node;

gulp.task('default', ['styles'], function() {
  gulp.watch('./*.scss', ['styles']);
});

gulp.task('build', ['styles'], function() {
  //nothing else, just build!
});

gulp.task('styles', function() {
  gulp.src('./*.scss')
      .pipe(concat('index.css'))
      .pipe(sass().on('error', sass.logError))
      .pipe(prefix())
      //.pipe(cssmin())
      .pipe(gulp.dest('./'));
});


// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill();
})