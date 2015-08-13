/* globals require, module */

var gulp = require('gulp');
var utils = require('gulp-util');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var config_mocha = {
	configFile: 'src/test/karma.conf.js',
	action: 'run'
};

var config_istanbul_thresholds = {
	thresholds: {
		global: 5
	}
};

module.exports = function(done) {
	gulp.src('src/main/**/*.js')
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			gulp.src('src/test/**/*.spec.js')
				.pipe(mocha(config_mocha))
				.pipe(istanbul.writeReports())
				.pipe(istanbul.enforceThresholds(config_istanbul_thresholds))
				.on('error', utils.log)
				.on('end', done);
		})
		.on('error', utils.log);
};
