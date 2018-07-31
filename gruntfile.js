'use strict';


module.exports = function(grunt) {
	var tasks = {
		copy: {
			server: {
				files: [
					// {
					//  expand: true,
					//  cwd:'source/server/',
					//  src:['**/*'],
					//  dest: 'build/server/',
					//  extDot: 'first'
					// },
					{
						src: 'package.json',
						dest: 'build/package.json'
					},

					{
						expand: true,
						cwd: 'source',
						src: ['**/*.js'],
						dest: 'build',
						extDot: 'first'
					},

				]
			},

		},
		eslint: {
			gruntfile: 'gruntfile.js',
			server: ['source/**/*.js'],
		},

	};

	grunt.initConfig(tasks);
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-eslint');


	grunt.registerTask('default', ['eslint', 'copy']);
};