/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
var handlebars = require('rollup-plugin-handlebars-plus');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');


const ENV = process.env.NODE_ENV || 'development';

const getBundleConfig = function (src, dest) {
    return {
        input: src,
        plugins: [
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
            commonjs(),
            handlebars({
                handlebars: {
                    options: {
                        sourceMap: ENV !== 'production' ? 'inline' : false
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
            sourcemap: ENV !== 'production' ? 'inline' : false
        },
        treeshake: ENV === 'production'
    };
};

module.exports = [
    getBundleConfig('scripts/pubswh/extentsMapOnReady.js', 'dist/scripts/extentsMapOnReady.js'),
    getBundleConfig('scripts/pubswh/plugins.js', 'dist/scripts/base_libs.js'),
    getBundleConfig('scripts/pubswh/resultsMap.js', 'dist/scripts/resultsMap.js'),
    getBundleConfig('scripts/pubswh/searchFormOnReady.js', 'dist/scripts/advanced_search.js'),
    getBundleConfig('scripts/metrics/pubGraphController.js', 'dist/scripts/metrics_publication.js'),
    getBundleConfig('scripts/metrics/pubsGraphController.js', 'dist/scripts/metrics_publications.js'),
    getBundleConfig('scripts/metrics/pubsAcquisitionGraphController.js', 'dist/scripts/metrics_publications_acquisition.js')
];
