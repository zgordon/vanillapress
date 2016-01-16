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

  		// concat: {
      //   options: {
      //     separator: ';'
      //   },
  		// 	dist: {
  		// 		src: [
      //       'src/js/data.js',
      //       'src/js/lib/class-list.js',
      //       'src/js/helpers.js',
      //       'src/js/router.js',
      //       'src/js/models.js',
      //       'src/js/lib/wysiwyg.js',
      //       'src/js/lib/markdown.js',
      //       'src/js/editor.js',
      //       'src/js/view.js',
      //       'src/js/app.js'
      //     ],
  		// 		dest: 'dist/js/build.js'
  		// 	}
  		// },

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
        // options: {
        //   livereload: true
        // },
        html: {
          files: ['index.html'],
        },
  			css: {
  				files: ['src/sass/*.scss', 'src/sass/*/*.scss'],
  				tasks: ['sass']
  			},
        // js: {
        //   files: ['src/js/**/*.js', 'src/js/*.js'],
        //   //tasks: ['jshint', 'concat']
        //   tasks: ['browserify']
        // },
  		},

      // browserify: {
      //   js: {
      //     src: ['src/js/app.js'],
      //     dest: 'dist/js/app.js'
      //   }
      // },

      browserify: {
        vendor: {
          src: [],
          dest: 'dest/js/app.js',
          // options: {
          //   require: ['jquery'],
          //   alias: {
          //     momentWrapper: './lib/moments.js'
          //   }
          // }
        },

        // concat: {
        //    'dest/js/app.js': ['public/vendor.js', 'public/app.js']
        //  },
      },

      // requirejs: {
      //   compile: {
      //     options: {
      //       baseUrl: "dist/js",
      //       mainConfigFile: "dist/src/build.js",
      //       out: "dist/js/optimized.js"
      //     }
      //   }
      // }

	   });

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-browserify');
  //grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-express');
	grunt.registerTask('default',['watch']);
  //grunt.registerTask('server',['express', 'watch']);
};
