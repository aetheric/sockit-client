/* globals require, module */

var gulp = require('gulp');
var utils = require('gulp-util');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var config_browserify = {
	debug: true
};

var config_rename_1 = {
	basename: 'client'
};

var config_sourcemaps = {
	loadMaps: true
};

var config_rename_2 = {
	extname: '.min.js'
};

module.exports = function() {
	return gulp.src('src/main/client/*.js')
		.pipe(browserify(config_browserify))
		.pipe(rename(config_rename_1))
		.pipe(gulp.dest('dist'))
		.pipe(buffer())
		.pipe(sourcemaps.init(config_sourcemaps))
		.pipe(uglify())
		.pipe(rename(config_rename_2))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
		.on('error', utils.log);
};
