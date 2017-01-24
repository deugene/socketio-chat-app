const gulp = require('gulp');
const shell = require('gulp-shell');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./server/tsconfig.json');

gulp.task('ts', () => {
  tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist/server'));
});

gulp.task('client:build:watch', shell.task([ 'ng build -w' ]));

gulp.task(
  'server:build:watch',
  () => gulp.watch([ 'server/**/*.ts' ], [ 'ts' ])
);

gulp.task(
  'server:reload:watch',
  [ 'ts' ],
  () => {
    setTimeout(
      shell.task([ 'NODE_ENV=development nodemon --watch ./dist/server ./server/bin/www' ]),
      2000
    );
  }
);

gulp.task(
  'default',
  [
    'server:build:watch',
    'server:reload:watch',
    'client:build:watch'
  ]
);
