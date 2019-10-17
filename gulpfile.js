const {src, dest, watch, parallel, series} = require('gulp'),
      autoprefixer = require('gulp-autoprefixer'),
      connect =   require('gulp-connect'),
      sass =      require('gulp-sass'),
      rename =    require('gulp-rename'),
      sourceMaps = require('gulp-sourcemaps'),
      stripComments = require('gulp-strip-comments'),
      concatCss = require('gulp-concat-css');

async function connectTask(done) {
    await connect.server({
        root: 'build',
        port: 8091,
        index: 'profile.html',
        livereload: true
    }, function () {
        this.server.on('close', done);
    });
}

function reloadTask(done) {
    // src('views/index.html')
    src('views/profile.html')
        .pipe(stripComments())
        .pipe(dest('build'))
        .pipe(connect.reload());
    done();
}

function jsTask(done) {
    src('scripts-source/scripts.js')
        .pipe(dest('build/scripts'))
        .pipe(connect.reload());
    done();
}

async function cssTask() {
    return await src('style-source/main.scss')
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', sass.logError))
        /*.pipe(autoprefixer({
           browsers: ['last 15 versions'],
           cascade: false
        }))*/
        .pipe(sourceMaps.write())
        .pipe(rename('main.css'))
        .pipe(dest('build'))
        // .pipe(dest('style-source/css'));
        .pipe(connect.reload());
}

function concatCssTask() {
    return src(['style-source/css/orig.css', 'style-source/css/main.css'])
        .pipe(concatCss("style.css"))
        .pipe(dest('build'))
        .pipe(connect.reload());
}

async function watchTask() {
    await watch(['style-source/main.scss'], cssTask);
    await watch(['build/orig.css'], reloadTask);
    // gulp.watch('scripts-source/!*.js', ['js']);
    // gulp.watch('build/img/!*.*', ['reload']);
    // gulp.watch('build/fonts/!*.*', ['reload']);
    await watch('views/*.html', reloadTask);
    // await watch('scripts-source/scripts.js', jsTask);
}

exports.style = cssTask;
exports.default = parallel(connectTask, reloadTask, cssTask, watchTask);
// exports.default = parallel(connectTask, reloadTask, cssTask, jsTask, watchTask);
