"use strict";

const gulp = require( 'gulp' ),
  browserify = require( 'browserify' ),
  source = require( 'vinyl-source-stream' ),
  buffer =  require( 'vinyl-buffer' ),
  watchify = require('watchify'),
  assign = require('lodash.assign'),
  gutil = require('gutil'),
  uglify = require('gulp-uglify')
;

let customOpts = {
  entries: ['./src/client.js'],
  debug: true
};

let opts = assign({ transform: ['brfs'] }, watchify.args, customOpts),
  watch = watchify(browserify(opts))
;

gulp.task('dev', bundle);
watch.on('update', bundle);
watch.on('log', gutil.log);

gulp.task('default', ['dev']);

function bundle() {

  return watch.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('client.bundle.js'))
    .pipe(gulp.dest('./build/js'))
  ;
}

gulp.task( 'js', function () {

  return browserify( './example/index.js' )
    .transform( 'babelify', { presets: ['es2015'] } )
    .bundle()
    .pipe( source( 'client.bundle.js' ) )
    .pipe(gulp.dest('./build/js'))
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe(gulp.dest('./build/js'))
  ;
} );