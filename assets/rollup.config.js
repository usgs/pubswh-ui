/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const getRollupPlugins = require('./rollup.plugins');


const ENV = process.env.NODE_ENV || 'development';

const getBundleConfig = function (output) {
    return {
        input: [
            'scripts/common.js',
            'scripts/manager/manager.js',
            'scripts/pubswh/extentsMapOnReady.js',
            'scripts/pubswh/pubswh_plugins.js',
            'scripts/pubswh/resultsMap.js',
            'scripts/pubswh/searchFormOnReady.js',
            'scripts/metrics/pubGraphController.js',
            'scripts/metrics/pubsGraphController.js',
            'scripts/metrics/pubsAcquisitionGraphController.js'
        ],
        experimentalCodeSplitting: true,
        plugins: getRollupPlugins(ENV),
        output
    };
};

module.exports = [
    getBundleConfig({
        dir: 'dist/scripts',
        format: 'system',
        sourcemap: ENV !== 'production'
    })
];
