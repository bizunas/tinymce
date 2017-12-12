/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('../../../tools/modules/rollup-patch');

module.exports = function (grunt) {
  grunt.initConfig({
    rollup: {
      options: {
        treeshake: true,
        moduleName: 'inlite',
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          resolve(),
          typescript({
            include: [
              '../../**/*.ts'
            ]
          }),
          patcher()
        ]
      },
      plugin: {
        files:[
          {
            dest: 'dist/inlite/theme.js',
            src: 'src/main/ts/Theme.ts'
          }
        ]
      }
      // demo: {
      //   files: [
      //     {
      //       dest: 'scratch/compiled/demo.js',
      //       src: 'src/demo/ts/demo/Demo.ts'
      //     }
      //   ]
      // }
    },

    uglify: {
      options: {
        beautify: {
          ascii_only: true,
          screw_ie8: false
        },

        compress: {
          screw_ie8: false
        }
      },

      "plugin": {
        files: [
          {
            src: "dist/inlite/theme.js",
            dest: "dist/inlite/theme.min.js"
          }
        ]
      }
    }

    // watch: {
    //   demo: {
    //     files: ["src/**/*.ts"],
    //     tasks: ["rollup:demo"],
    //     options: {
    //       livereload: true,
    //       spawn: false
    //     }
    //   }
    // }
  });

  grunt.task.loadTasks('../../../node_modules/grunt-rollup/tasks');
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-uglify/tasks");
  grunt.task.loadTasks("../../../node_modules/grunt-contrib-watch/tasks");

  grunt.registerTask("default", ["rollup", "uglify"]);
};