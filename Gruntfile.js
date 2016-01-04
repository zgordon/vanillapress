module.exports = function(grunt) {

    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/**
		 * Sass
		 */
		sass: {
		  dev: {
		    options: {
		      style: 'expanded',
		      sourcemap: 'none',
		    },
		    files: {
		      'style.css': 'sass/style.scss'
		    }
		  }
		},

	  	/**
	  	 * Watch
	  	 */
		watch: {
			css: {
				files: ['theme.html', 'sass/*.scss', 'sass/*/*.scss'],
				tasks: ['sass'],
				options: {
					livereload: {
						host: 'localhost',
						port: 35729,
						//key: grunt.file.read('path/to/ssl.key'),
						//cert: grunt.file.read('path/to/ssl.crt')
						// you can pass in any other options you'd like to the https server, as listed here: http://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
					}
				},
			}
		},

	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['watch']);
}