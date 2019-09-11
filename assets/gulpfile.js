const gulp = require('gulp');
const RevAll = require('gulp-rev-all');


gulp.task('revall', function () {
    return gulp.src('dist/**/*.*')
        .pipe(RevAll.revision({
            dontGlobal: [
                /rev-manifest.json$/,

                // Skip already hashed files
                /.+\.[a-f0-9]{8}\..+$/,

                // Skip all vendor JS - there are many various loading problems
                /vendor\/.+/
            ],
            includeFilesInManifest: ['.css', '.js', '.ico', '.svg', '.png', '.jpg']
        }))
        .pipe(gulp.dest('dist'))
        .pipe(RevAll.manifestFile({fileName: 'manifest.json'}))
        .pipe(gulp.dest('dist'));
});
