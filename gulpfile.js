var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var clean = require("gulp-clean");
var header = require("gulp-header");

var rollup = require("rollup");
var commonjs = require("rollup-plugin-commonjs");
var json = require("rollup-plugin-json");
var resolve = require("rollup-plugin-node-resolve");

var package = require("./package.json");
var banner =`
/*!
 * ${package.name} v${package.version}
 * (c) 2018-present ${package.author.name} <${package.author.email}>
 * Homepage ${package.homepage}
 * Released under the License ${package.license}
 */
`


var outputDir = 'dist/'

gulp.task('build', ['rollup', 'min'], function () {
	return gulp.src('./*.temp.js', { read: false })
		.pipe(clean());
})

function runRollup(input, output) {
	var inputopt = {
		plugins: [
			resolve(),
			json(),
			commonjs()
		]
	}
	var outputopt = {
		format: 'umd',
		name: 'qrcodeMatrix',
		banner: banner,
		sourcemap: false
	}
	return rollup.rollup(Object.assign({}, inputopt, {
		input: input
	})).then(function (bundle) {
		return bundle.write(Object.assign({}, outputopt, {
			file: output,
		}))
	})
}

gulp.task('browserFile', function () {
	return gulp.src([
		'./index.js',
		'./onlyUTF8.js'
	])
		.pipe(replace(/(['"])gbk.js(\1)/, "$1gbk.js/dist/gbk$1"))
		.pipe(rename({
			extname: ".temp.js"
		}))
		.pipe(gulp.dest('./'))
})

gulp.task('clear:outdir', function () {
	return gulp.src(outputDir, { read: false })
		.pipe(clean());
})

// gulp.task('clear:tempFile', function(){
// 	return gulp.src([
// 		'./index.temp.js',
// 		'./onlyUTF8.temp.js'
// 	],{read: false})
// 		.pipe(clean());
// })

gulp.task('rollup', ['clear:outdir', 'browserFile'], function () {
	return Promise.all([
		runRollup('./index.temp.js', outputDir + 'qrcodeMatrix.js'),
		runRollup('./onlyUTF8.temp.js', outputDir + 'qrcodeMatrix.utf8.js')
	])
})

gulp.task('min', ['rollup'], function () {
	return gulp.src(['dist/!(*.min).js'])
		.pipe(uglify())
		.pipe(header(banner))
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(gulp.dest(outputDir));
})

gulp.task('default', ['build']);