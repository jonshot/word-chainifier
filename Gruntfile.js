/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration. 
        uglify: {
            options: {
                screwIE8: true
            },
            js: {
                files: {'lib/static/js/app.min.js': [
                        'lib/static/js/src/components/**/*.js',
                        'lib/static/js/src/app.js'
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
        concat: {
            options: {
                separator: ";\n",
                stripBanners: true
            },
            dist: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/angular/angular.min.js'
                ],
                dest: 'lib/static/js/libs.min.js'
            },
        },
        sass: {// Task
            dist: {// Target
                options: {// Target options
                    style: 'compressed',
                    compass: true
                },
                files: {// Dictionary of files
                    'lib/static/css/styles.min.css': 'lib/static/scss/styles.scss'
                }
            }
        },
        watch: {
            scss: {
                files: ['lib/static/scss/**/*.scss'],
                tasks: ['sass']
            },
            scripts: {
                files: ['lib/static/js/src/**/*.js'],
                tasks: ['jshint', 'uglify', 'concat']
            }
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
};
