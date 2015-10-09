require('babel-core/register')({
  optional: ['es7'],
});

import gulp from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import sass from 'gulp-sass';
import concatCss from 'gulp-concat';
import minifyCss from 'gulp-minify-css';
import eslint from 'gulp-eslint';
import sasslint from 'gulp-sass-lint';
import runSequence from 'run-sequence';
import mocha from 'gulp-mocha';
import minifyHtml from 'gulp-minify-html';
import env from 'gulp-env';

const directories = {
  source: {
    base: 'src/',
    script: 'src/scripts',
    style: 'src/styles',
    images: 'src/images',
  },
  test: 'test',
  server: 'server',
  distribution: 'static',
};

gulp.task('env-testing', () => {
  env({
    vars: {
      NODE_ENV: 'testing',
    },
  });
});

gulp.task('env-development', () => {
  env({
    vars: {
      NODE_ENV: 'development',
    },
  });
});

gulp.task('lint:sass', () => {
  return gulp.src(directories.source.style + '/**/*.scss')
    .pipe(sasslint())
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
});

gulp.task('lint:js', () => {
  return gulp.src(
    [
      './*.js',
      directories.source.script + '/**/*.js',
      directories.test + '/**/*.js',
      directories.server + '/**/*.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:js', 'lint:sass']);

gulp.task('html', () => {
  return gulp.src(directories.source.base + '/index.html')
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('html:production', () => {
  return gulp.src(directories.source.base + '/index.html')
    .pipe(minifyHtml())
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('images', () => {
  return gulp.src(directories.source.images + '/*')
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('js', () => {
  return browserify({
    entries: directories.source.script + '/main.js',
    extensions: ['.js'],
    debug: true,
  })
  .transform(babelify.configure({
    optional: ['es7'],
  }))
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(directories.distribution));
});

gulp.task('js:production', () => {
  return browserify({
    entries: directories.source.script + '/main.js',
    extensions: ['.js'],
    debug: false,
  })
  .transform(babelify.configure({
    optional: ['es7'],
  }))
  .transform({
    global: true,
    sourcemap: false,
  }, 'uglifyify')
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(directories.distribution));
});

gulp.task('sass', () => {
  return gulp.src(directories.source.style + '/*.scss')
    .pipe(sass({includePaths: ['./node_modules/bootstrap/scss']}).on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(gulp.dest(directories.distribution + '/'));
});

gulp.task('sass:production', () => {
  return gulp.src(directories.source.style + '/*.scss')
    .pipe(sass({includePaths: ['./node_modules/bootstrap/scss']}).on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(gulp.dest(directories.distribution + '/'));
});

gulp.task('test', ['env-testing'], () => {
  return gulp.src(directories.test + '/**/*.js', { read: false })
    .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('build', () => {
  runSequence('lint', 'test', ['js', 'sass', 'html', 'images', 'env-development']);
});

gulp.task('build:production', () => {
  runSequence('lint', 'test', ['js:production', 'sass:production', 'html:production', 'images']);
});

gulp.task('watch', ['env-development'], () => {
  return gulp.watch(
    [
      '*.js',
      directories.source.base + '/**/*.js',
      directories.source.style + '/**/*.scss',
      directories.test + '/**/*.js',
      directories.server + '/**/*.js',
    ],
    ['build']
  );
});

gulp.task('default', ['build', 'watch']);
