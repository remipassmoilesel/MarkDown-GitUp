var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');
var minifycss = require('gulp-minify-css');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack-stream');
var named = require('vinyl-named');

var webpackEntries = ['./src/scripts/main.js'];

/*
Gestion des images
*/
gulp.task('images', function() {
    gulp.src('src/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images/'));
});

/*
Gestion des scripts
*/
gulp.task('scripts', function() {
    return gulp.src(webpackEntries)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(named())
        .pipe(webpack({
            progress: false,
            stats: {
                colors: true,
                modules: false,
                reasons: false
            },
            module: {
                loaders: [
                    {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
                    {test: /\.html$/, loader: 'raw-loader'}
                ]
            },
            plugins: [new ExtractTextPlugin("[name].css")],
            watch: true
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

/*
Tache par défaut
*/
gulp.task('default', ['scripts', 'images'], function() {
    gulp.watch("src/scripts/**/*", ['scripts']);
    gulp.watch("src/images/**", ['images']);
});
