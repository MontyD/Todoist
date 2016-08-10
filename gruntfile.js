'use strict';

var Webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var bundlesPath = path.resolve(__dirname, 'public', 'bundles');

var entryPoints = {
    room: path.resolve(__dirname, 'frontend', 'js', 'room.es6.js'),
};

module.exports = function(grunt) {
    grunt.initConfig({
        webpack: {
            initial: {
                entry: entryPoints,
                output: {
                    filename: '[name].js',
                    path: bundlesPath
                },
                module: {

                    loaders: [{
                            test: /\.es6.js$/,
                            loader: 'babel-loader'
                        }, {
                            test: /\.html$/,
                            loader: 'html-loader'
                        }, {
                            test: /\.(jpe?g|png|gif|svg)$/i,
                            loaders: [
                                'file?hash=sha512&digest=hex&name=[hash].[ext]',
                                'image?bypassOnDebug&optimizationLevel=7&interlaced=false'
                            ]
                        }

                    ]
                },
                plugins: [
                    // new Webpack.optimize.UglifyJsPlugin({
                    //     minimize: true
                    // }),
                    // new StatsPlugin(path.join(__dirname, 'stats.json'), {
                    //     chunkModules: true
                    // })
                ]
            }
        },
        sass: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'frontend/scss',
                    src: ['*.scss'],
                    dest: 'public/css',
                    ext: '.css'
                }]
            }
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 5 versions'],
                        remove: false
                    })
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css'],
                    dest: 'public/css'
                }]
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'public/css',
                    ext: '.min.css'
                }]
            }

        },
        watch: {
            css: {
                files: ['frontend/scss/**/*.scss'],
                tasks: ['sass', 'postcss', 'cssmin']
            },
            js: {
                files: ['frontend/js/**/*.js', 'frontend/js/**/*.html'],
                tasks: ['webpack']
            },
            options: {
                livereload: true,
            },
        },
        nodemon: {
            dev: {
                script: 'app.js',
                cwd: __dirname,
                ext: 'js',
                ignore: ['node_modules/**', 'frontend/**', 'public/**', 'stats.json', '.sass-cache/**'],
            }

        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            tasks: ['nodemon', 'watch']
        }
    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask('default', ['concurrent']);
};
