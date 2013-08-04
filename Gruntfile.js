'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    express: {
      options: {
        port: 3000,
        background: true
      },
      dev: {
        options: { script: 'app.js' }
      },
      prod: {
        options: {
          script: 'app.js',
          node_env: 'production'
        }
      },
      test: {
        options: { script: 'app.js' }
      }
    },
    uglify: {
      target: {
        files: {
          'public/js/application.min.js': [
            "bower_components/bootstrap/js/transition.js",
            "bower_components/bootstrap/js/alert.js",
            "bower_components/bootstrap/js/button.js",
            "bower_components/bootstrap/js/carousel.js",
            "bower_components/bootstrap/js/collapse.js",
            "bower_components/bootstrap/js/dropdown.js",
            "bower_components/bootstrap/js/modal.js",
            "bower_components/bootstrap/js/tooltip.js",
            "bower_components/bootstrap/js/popover.js",
            "bower_components/bootstrap/js/scrollspy.js",
            "bower_components/bootstrap/js/tab.js",
            "bower_components/bootstrap/js/affix.js",
            "public/js/instafilos.js"
          ]
        }
      }
    },
    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['express:dev']);

};