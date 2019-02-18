import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('vendor:mousetrap', () => {
    return gulp.src('node_modules/mousetrap/mousetrap.min.js')
      .pipe(gulp.dest(`dist/${args.vendor}/vendor`))
      .pipe(gulpif(args.watch, livereload()))
  })

  gulp.task('vendor:mousetrap-record', () => {
    return gulp.src('node_modules/mousetrap/plugins/record/mousetrap-record.min.js')
      .pipe(gulp.dest(`dist/${args.vendor}/vendor`))
      .pipe(gulpif(args.watch, livereload()))
  })

gulp.task('vendor:react', () => {
  return gulp.src('node_modules/react/cjs/react.production.min.js')
    .pipe(gulp.dest(`dist/${args.vendor}/vendor/react`))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('vendor:react-dom', () => {
  return gulp.src('node_modules/react-dom/cjs/react-dom.production.min.js')
    .pipe(gulp.dest(`dist/${args.vendor}/vendor/react-dom`))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('vendor', [
  'vendor:mousetrap',
  'vendor:mousetrap-record',
  'vendor:react',
  'vendor:react-dom'
])