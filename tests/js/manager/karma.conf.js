// Karma configuration
// Generated on Wed Dec 30 2015 09:23:08 GMT-0600 (CST)
var sourcePreprocessors = ['coverage'];
function isDebug(argument) {
    return argument === '--debug';
};
if (process.argv.some(isDebug)) {
    sourcePreprocessors = [];
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
        'tests/js/manager/test-main.js',
      {pattern: 'pubs_ui/bower_components/Squire.js/src/Squire.js', included: false},
      {pattern: 'pubs_ui/bower_components/jquery/dist/jquery.js', included: false},
      {pattern: 'pubs_ui/bower_components/jquery-ui/jquery-ui.js', included: false},
      {pattern: 'pubs_ui/bower_components/select2/dist/js/select2.full.js', included: false},
      {pattern: 'pubs_ui/bower_components/underscore/underscore.js', included: false},
      {pattern: 'pubs_ui/bower_components/backbone/backbone.js', included: false},
      {pattern: 'pubs_ui/bower_components/tinymce/tinymce.js', included: false},
      {pattern: 'pubs_ui/bower_components/bootstrap/dist/js/bootstrap.js', included: false},
      {pattern: 'pubs_ui/bower_components/text/text.js', included: false},
      {pattern: 'pubs_ui/bower_components/backbone.paginator/lib/backbone.paginator.js', included: false},
      {pattern: 'pubs_ui/bower_components/backgrid/lib/backgrid.js', included: false},
      {pattern: 'pubs_ui/bower_components/backgrid-select-all/backgrid-select-all.js', included: false},
      {pattern: 'pubs_ui/bower_components/backgrid-paginator/backgrid-paginator.js', included: false},
      {pattern: 'pubs_ui/bower_components/handlebars/handlebars.amd.js', included: false},
      {pattern: 'pubs_ui/bower_components/requirejs-hbs/hbs.js', included: false},
      {pattern: 'pubs_ui/bower_components/backbone.stickit/backbone.stickit.js', included: false},
      {pattern: 'pubs_ui/bower_components/moment/min/moment.min.js', included: false},
      {pattern: 'pubs_ui/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js', included: false},
      {pattern: 'pubs_ui/bower_components/loglevel/dist/loglevel.min.js', included: false},
      {pattern: 'pubs_ui/manager/static/js/**/*.js', included: false},
      {pattern: 'pubs_ui/manager/static/js/hb_templates/*.hbs', included: false},
      {pattern: 'tests/js/manager/**/*.js', included: false}
        ],

    // list of files to exclude
    exclude: [
        'pubs_ui/manager/static/js/init.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'pubs_ui/manager/static/js/**/*.js': sourcePreprocessors
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      reporters : [
        {type: 'html', dir : 'coverage/manager/'},
        {type: 'cobertura', dir: 'coverage/manager/'},
        {type: 'lcovonly', dir: 'coverage/manager/'}
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
