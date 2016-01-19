module.exports = function(grunt) {

    grunt.initConfig({
  		pkg: grunt.file.readJSON('package.json'),

  		jshint: {
  			files: ['Gruntfile.js', 'src/js/**/*.js', 'src/js/*.js'],
        options: {
          globals: {
            console: true
          }
        },
        // ignore_warning: {
        //   options:
        // }
  		},

  		sass: {
  		  dev: {
  		    options: {
  		      style: 'expanded',
  		      sourcemap: 'none',
  		    },
  		    files: {
  		      'style.css': 'src/sass/style.scss'
  		    }
  		  }
  		},

      // Express Server
      express: {
        all: {
          options: {
            port: 9000,
            hostname: 'localhost',
            bases: '.',
            livereload: true
          }
        }
      },

  		watch: {
        options: {
          livereload: true
        },
        html: {
          files: ['index.html'],
        },
  			css: {
  				files: ['src/sass/*.scss', 'src/sass/*/*.scss'],
  				tasks: ['sass']
  			},
        js: {
          files: ['src/js/*.js','src/js/**/*.js'],
          //tasks: ['jshint', 'concat']
          tasks: ['jshint', 'browserify']
        },
  		},

      browserify: {
        'dist/js/app.js': ['src/js/app.js']
      }

      // browserify: {
      //   js: {
      //     src: 'src/js/app.js',
      //     dist: 'dist/js/app.js'
      //   },
      // },

	   });

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  //grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-express');
	grunt.registerTask('default',['watch']);
  grunt.registerTask('server',['express', 'watch']);
};
