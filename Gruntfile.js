/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration. 
        uglify: {
            options: {
               // sourceMap:true,
                screwIE8: true,
               // beautify: true
            },
            joules: {
                files: {'js/app.min.js': [
                        'js/src/components/**/*.js',
                        'js/src/app.module.js'
                    ]}
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            }
        },
        sass: {// Task
            dist: {// Target
                options: {// Target options
                    style: 'compressed',
                    compass: true
                },
                files: {// Dictionary of files
                    'css/styles.min.css': 'scss/styles.scss'
                }
            }
        },
        watch: {
            scss: {
                files: ['scss/**/*.scss'],
                tasks: ['sass']
            },
            scripts: {
                files: ['js/src/**/*.js'],
                tasks: ['jshint', 'uglify']
            }
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
};
