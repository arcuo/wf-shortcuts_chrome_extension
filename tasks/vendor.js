import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('vendor:mousetrap', () => {
    return gulp.src('node_modules/mousetrap/mousetrap.min.js')
      .pipe(gulp.dest(`dist/${args.vendor}/vendor`))
      .pipe(gulpif(args.watch, livereload()))
  })

  gulp.task('vendor', [
    'vendor:mousetrap'
  ])