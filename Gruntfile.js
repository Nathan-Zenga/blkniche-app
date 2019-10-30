module.exports = function(grunt) {

	// Project configuration.
	/*grunt.initConfig({
		uglify: {
			build: {
				files: [{
					src: 'public/js/src/main.js',
					dest: 'public/js/main.min.js'
				},
				{
					src: 'public/js/src/detect-config.js',
					dest: 'public/js/detect-config.min.js'
				}]
			}
		}
	});*/

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	// grunt.registerTask('default', ['uglify']);
};