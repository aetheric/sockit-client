/* globals module, MOCHA, MOCHA_ADAPTER */

module.exports = function(config) {
	config.set({

		singleRun: true,
		basePath: '../..',

		files: [
			MOCHA,
			MOCHA_ADAPTER,
			'src/main/**/*.js',
			'src/test/**/*.spec.js'
		],

		frameworks: [
			'chai',
			'mocha',
			'commonjs'
		],

		preprocessors: {
			'src/test/*.spec.js': [
				'coverage',
				'commonjs'
			]
		},

		browsers: [
			'PhantomJS'
		],

		reporters: [
			'progress',
			'coverage',
			'junit'
		],

		junitReporter: {
			outputFile: 'out/test-results.xml'
		},

		coverageReporter: {
			file: 'cobertura.txt',
			type: 'cobertura',
			dir: 'out'
		},

		plugins: [
			'karma-mocha',
			'karma-coverage',
			'karma-commonjs',
			'karma-junit-reporter',
			'karma-phantomjs-launcher'
		]

	});
};
