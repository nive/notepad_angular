'use strict';
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({
        replaceString: /\bgulp[\-.]/
    });

gulp.task('lint', function() {
    gulp.src([
        'gulpfile.js',
        'app/**/*.js'
    ])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(plugins.webserver());
});

gulp.task('default', ['webserver']);
