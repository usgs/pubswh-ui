/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const bowerResolve = require('rollup-plugin-bower-resolve');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const handlebars = require('rollup-plugin-handlebars-plus');
const inject = require('rollup-plugin-inject');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');


const ENV = process.env.NODE_ENV || 'development';

const getBundleConfig = function (src, dest) {
    return {
        input: src,
        plugins: [
            inject({
                include: '**/*.js',
                //exclude: 'node_modules/**',
                modules: {
                    $: 'jquery',
                    jQuery: 'jquery',
                    moment: 'moment'
                }
            }),
            resolve({
                // use "module" field for ES6 module if possible
                module: true, // Default: true

                // use "jsnext:main" if possible
                // – see https://github.com/rollup/rollup/wiki/jsnext:main
                jsnext: false,

                // use "main" field or index.js, even if it's not an ES6 module
                // (needs to be converted from CommonJS to ES6
                // – see https://github.com/rollup/rollup-plugin-commonjs
                main: false,  // Default: true

                // some package.json files have a `browser` field which
                // specifies alternative files to load for people bundling
                // for the browser. If that's you, use this option, otherwise
                // pkg.browser will be ignored
                browser: false  // Default: false
            }),
            json(),
            bowerResolve({
                // The working directory to use with bower (i.e the directory where
                // the `bower.json` is stored).
                // Default is `process.cwd()`.
                //cwd: '/tmp',

                // Use `bower` offline.
                // Default is `true`.
                //offline: false,

                // Use "module" field for ES6 module if possible, default is `true`.
                // See: https://github.com/rollup/rollup/wiki/pkg.module
                module: true,

                // Use "jsnext:main" field for ES6 module if possible, default is `true`.
                // This field should not be used, use `module` entry instead, but it is `true`
                // by default because of legacy packages.
                // See: https://github.com/rollup/rollup/wiki/jsnext:main
                jsnext: true,

                // if there's something your bundle requires that you DON'T
                // want to include, add it to 'skip'
                //skip: [ 'some-big-dependency' ],    // Default: []

                // Override path to main file (relative to the module directory).
                override: {
                    //lodash: 'dist/lodash.js'
                    'backbone-pageable': 'lib/backbone-pageable.js',
                    'select2': 'dist/js/select2.full.js',
                    'tinymce': 'tinymce.js',
                    'bootstrap': 'dist/js/bootstrap.js',
                    'text': 'text.js',
                    'underscore': 'underscore.js',
                    'backbone': 'backbone.js',
                    'backbone.paginator': 'lib/backbone.paginator.js',
                    'backgrid': 'lib/backgrid.js',
                    'backgrid-select-all': 'backgrid-select-all.js',
                    'backgrid-paginator': 'backgrid-paginator.js',
                    'backbone.stickit': 'backbone.stickit.js',
                    'moment': 'min/moment.min.js',
                    'datetimepicker': 'eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                    'loglevel': 'dist/loglevel.min.js'
                }
            }),
            commonjs(),
            handlebars({
                handlebars: {
                    options: {
                        sourceMap: ENV !== 'production' ? 'inline': false
                    }
                },
                templateExtension: '.hbs'
            }),
            buble({
                objectAssign: 'Object.assign',
                transforms: {
                    dangerousForOf: true
                }
            }),
            replace({
              'process.env.NODE_ENV': JSON.stringify(ENV)
            }),
            ENV === 'production' && uglify({
                compress: {
                    dead_code: true,
                    drop_console: true
                }
            })
        ],
        output: {
            name: 'pubs_bundle',
            file: dest,
            format: 'iife',
            sourcemap: ENV !== 'production' ? 'inline': false
        },
        treeshake: ENV === 'production'
    };
};

module.exports = [
    getBundleConfig('scripts/manager/init.js', 'dist/scripts/manager.js'),
    getBundleConfig('scripts/pubswh/extentsMapOnReady.js', 'dist/scripts/extentsMapOnReady.js'),
    getBundleConfig('scripts/pubswh/plugins.js', 'dist/scripts/base_pubswh.js'),
    getBundleConfig('scripts/pubswh/resultsMap.js', 'dist/scripts/resultsMap.js'),
    getBundleConfig('scripts/pubswh/searchFormOnReady.js', 'dist/scripts/advanced_search.js'),
    getBundleConfig('scripts/metrics/pubGraphController.js', 'dist/scripts/metrics_publication.js'),
    getBundleConfig('scripts/metrics/pubsGraphController.js', 'dist/scripts/metrics_publications.js'),
    getBundleConfig('scripts/metrics/pubsAcquisitionGraphController.js', 'dist/scripts/metrics_publications_acquisition.js')
];
