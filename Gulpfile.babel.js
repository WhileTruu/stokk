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
import istanbul from 'gulp-babel-istanbul';
import minifyHtml from 'gulp-minify-html';
import env from 'gulp-env';
import sloc from 'gulp-sloc';
import cache from 'gulp-cached';
import remember from 'gulp-remember';
import watchify from 'watchify';
import notifier from 'node-notifier';

import conf from './server/conf';

const directories = {
  root: './*.js',
  source: {
    base: 'src',
    index: 'src/index.html',
    scripts: 'src/scripts/**/*.js',
    main: 'src/scripts/main.js',
    styles: 'src/styles/**/*.scss',
    cssStyles: 'src/styles/**/*.css',
    images: 'src/images/**/*',
    fonts: 'src/styles/fonts/*',
    music: 'src/music/*',
  },
  test: 'test/**/*.js',
  server: 'server/**/*.js',
  distribution: 'static',
};

gulp.task('notify', () => {
  notifier.notify({
    'title': 'Stokk',
    'message': 'gulp build: finished',
    'icon': 'atom',
  });
});

gulp.task('env-testing', () => {
  env({
    vars: {
      NODE_ENV: conf.testing.NODE_ENV,
    },
  });
});

gulp.task('env-development', () => {
  env({
    vars: {
      NODE_ENV: conf.development.NODE_ENV,
    },
  });
});

gulp.task('lint:sass', () => {
  return gulp.src(directories.source.styles)
    .pipe(remember('styles'))
    .pipe(sasslint())
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
});

gulp.task('lint:scripts', () => {
  return gulp.src(directories.source.scripts)
    .pipe(remember('scripts'))
    .pipe(eslint())
    .pipe(eslint.results((result) => {
      if (result.errorCount > 0) {
        notifier.notify({
          'title': 'Stokk',
          'message': 'eslint error!',
          'icon': 'dialog-error',
        });
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:server', () => {
  return gulp.src(
    [
      directories.root,
      directories.test,
      directories.server,
    ])
    .pipe(remember('server'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:scripts', 'lint:server', 'lint:sass']);

gulp.task('line-count', () => {
  return gulp.src(
    [
      directories.root,
      directories.source.scripts,
      directories.test,
      directories.server,
    ])
    .pipe(remember('scripts'))
    .pipe(sloc());
});

gulp.task('html', () => {
  return gulp.src(directories.source.index)
    .pipe(cache('html'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('html:production', () => {
  return gulp.src(directories.source.index)
    .pipe(minifyHtml())
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('images', () => {
  return gulp.src(directories.source.images)
    .pipe(cache('images'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('fonts', () => {
  return gulp.src(directories.source.fonts)
    .pipe(cache('fonts'))
    .pipe(gulp.dest(directories.distribution + '/fonts'));
});

gulp.task('music', () => {
  return gulp.src(directories.source.music)
    .pipe(cache('music'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('js', () => {
  const opts = {
    entries: directories.source.main,
    extensions: ['.js'],
    debug: true,
    transform: babelify.configure({
      optional: ['es7'],
    }),
  };
  return browserify(opts)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('js:watch', () => {
  const opts = Object.assign({
    entries: directories.source.main,
    extensions: ['.js'],
    debug: true,
    transform: babelify.configure({
      optional: ['es7'],
    }),
  }, watchify.args);
  return watchify(browserify(opts))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('js:production', () => {
  return browserify({
    entries: directories.source.main,
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
  return gulp.src([directories.source.styles, directories.source.cssStyles])
    .pipe(remember('styles'))
    .pipe(sass({includePaths: ['./node_modules/bootstrap/scss', './node_modules/font-awesome/scss']}).on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(gulp.dest(directories.distribution));
});

gulp.task('sass:production', () => {
  return gulp.src([directories.source.styles, directories.source.cssStyles])
    .pipe(sass({includePaths: ['./node_modules/bootstrap/scss', './node_modules/font-awesome/scss']}).on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(gulp.dest(directories.distribution));
});

function runTest() {
  return gulp.src(directories.test, {read: false})
    .pipe(remember('test'))
    .pipe(mocha({reporter: 'nyan', timeout: 10000}));
}

gulp.task('test', ['env-testing'], runTest);

gulp.task('coverage', ['env-testing', 'coverage:init'], () => {
  return runTest()
    .pipe(istanbul.writeReports());
});

gulp.task('coverage:init', () => {
  return gulp.src(directories.server)
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('build', () => {
  runSequence(['line-count', 'lint'], 'test', ['js', 'sass', 'html', 'images', 'fonts', 'music'], 'notify');
});

gulp.task('build:watch', () => {
  runSequence(['line-count', 'lint:scripts', 'lint:sass'], ['js:watch', 'sass', 'html', 'images', 'fonts', 'music', 'env-development'], 'notify');
});

gulp.task('build:watch:server', () => {
  runSequence(['line-count', 'lint:server'], 'test', 'env-development');
});

gulp.task('build:production', () => {
  runSequence(['line-count', 'lint'], 'test', ['js:production', 'sass:production', 'html:production', 'images', 'fonts', 'music']);
});

gulp.task('watch:src', () => {
  return gulp.watch(
    [
      directories.source.scripts,
      directories.source.styles,
      directories.source.images,
      directories.source.fonts,
      directories.source.music,
    ], ['build:watch']);
});

gulp.task('watch:server', () => {
  return gulp.watch(
    [
      directories.root,
      directories.test,
      directories.server,
    ], ['build:watch:server']);
});

gulp.task('watch', ['env-development', 'watch:src', 'watch:server']);

gulp.task('default', ['build', 'watch']);
