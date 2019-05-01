/**
 * Rollup plugin configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const handlebars = require('rollup-plugin-handlebars-plus');
const inject = require('rollup-plugin-inject');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');


module.exports = function (env) {
    return [
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
            mainFields: [
                // use "module" field for ES6 module if possible
                'module'
            ],

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
                    sourceMap: env !== 'production' ? 'inline': false
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
          'process.env.NODE_env': JSON.stringify(env)
        }),
        env === 'production' && uglify({
            compress: {
                dead_code: true,
                drop_console: true
            }
        }, minify)
    ];
};
