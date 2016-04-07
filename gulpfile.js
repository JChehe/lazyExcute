var gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	notify = require('gulp-notify');

gulp.task('scripts',function(){
  gulp.src('lazyExcute.js')
    .pipe(uglify())
    .pipe(rename('lazyExcute.min.js'))
    .pipe(gulp.dest('./'))
});

gulp.watch('./lazyExcute.js', ['scripts']);

gulp.task('default', ['scripts']);