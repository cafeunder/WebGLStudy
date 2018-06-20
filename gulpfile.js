var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourceMaps = require('gulp-sourcemaps');
var tsProject = ts.createProject('tsconfig.json');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

var TS_SRC = './src/**/*.ts';
var JS_DEST = './js/';
var env = process.env.NODE_ENV;

gulp.task('clean', function() {
	del([JS_DEST+"*"]);
});

gulp.task('compile', ['clean'], function() {
	if (env === 'production') {
		return tsProject.src()
			.pipe(tsProject())
			.pipe(uglify())
			.pipe(gulp.dest(JS_DEST));
	} else {
		return tsProject.src()
			.pipe(sourceMaps.init())
			.pipe(tsProject())
			.js.pipe(sourceMaps.write('./'))
			.pipe(gulp.dest(JS_DEST));
	}
});

gulp.task('default', ['compile']);