// Dummy
module.exports = null;

require('./analyticsData.js');
require('./analyticsGraph.js');
require('./dataUtils.js');

(function() {
        var DAY_FORMAT = 'MMM DD YYYY';
    var MONTH_FORMAT = 'MMM YYYY';

    var pageURI = '/publication/' + CONFIG.PUBSID;

    var yearSessionsDiv = document.getElementById('year-sessions-container');
    var recentSessionsDiv = document.getElementById('recent-sessions-container');
    var yearVisitorsDiv = document.getElementById('year-visitors-container');
    var recentVisitorsDiv = document.getElementById('recent-visitors-container');
    var yearDownloadsDiv = document.getElementById('year-downloads-container');
    var recentDownloadsDiv = document.getElementById('recent-downloads-container');

    var sessionsMetric = {expression : 'ga:sessions'};
    var visitorsMetric = {expression: 'ga:users'};
    var downloadsMetric = {expression: 'ga:totalEvents'};
    var pageFilter = {
        dimensionName : 'ga:pagePath',
        operator : 'EXACT',
        expressions : [pageURI]
    };
    var downloadsEventFilter = {
        dimensionName : 'ga:eventCategory',
        operator: 'EXACT',
        expressions: ['Downloads']
    };
    var metricsAndDimFilters = [
        {
            metrics : [sessionsMetric],
            dimFilters : [{filters: [pageFilter]}]
        }, {
            metrics : [visitorsMetric],
            dimFilters : [{filters: [pageFilter]}]
        }, {
            metrics: [downloadsMetric],
            dimFilters : [{
                operator: 'AND',
                filters: [pageFilter, downloadsEventFilter]
            }]
        }
    ];

    var transformToGraphData = function(metricName, row) {
        return [row.date.toDate(), parseInt(row[metricName])];
    };
    var transformToSessionsData = _.partial(transformToGraphData, sessionsMetric.expression);
    var transformToVisitorsData = _.partial(transformToGraphData, visitorsMetric.expression);
    var transformToDownloadsData = _.partial(transformToGraphData, downloadsMetric.expression);

    // When the two calls to GA where made simultaneously, frequently only one of the calls worked.
    // Therefore, we are waiting until the first call returns before making the second request.
    var monthlyDataPromise = METRICS.analyticsData.batchFetchMonthlyPastYear(metricsAndDimFilters);

    monthlyDataPromise
        .done(function(data) {
            var sessionsData = data[0].map(transformToSessionsData);
            var visitorsData = data[1].map(transformToVisitorsData);
            var downloadsData = data[2].map(transformToDownloadsData);

            METRICS.analyticsGraph.createGraph(yearSessionsDiv, sessionsData, {
                ylabel : 'Sessions',
                title : 'Visitors per month',
                dateFormat : MONTH_FORMAT
            });
            METRICS.analyticsGraph.createGraph(yearVisitorsDiv, visitorsData, {
                ylabel : 'Users',
                title : 'Unique visitors per month',
                dateFormat : MONTH_FORMAT
            });
            METRICS.analyticsGraph.createGraph(yearDownloadsDiv, downloadsData, {
                ylabel : 'Downloads',
                title : 'Downloads per month',
                dateFormat : MONTH_FORMAT
            });
        })
        .fail(function(response) {
            yearSessionsDiv.innerHTML = response.responseJSON.error.message;
        })
        .always(function() {
            METRICS.analyticsData.batchFetchPast30Days(metricsAndDimFilters)
                .done(function (data) {
                    var sessionsData = data[0].map(transformToSessionsData);
                    var visitorsData = data[1].map(transformToVisitorsData);
                    var downloadsData = data[2].map(transformToDownloadsData);

                    METRICS.analyticsGraph.createGraph(recentSessionsDiv, sessionsData, {
                        ylabel: 'Sessions',
                        title: 'Visitors per day',
                        dateFormat: DAY_FORMAT
                    });
                    METRICS.analyticsGraph.createGraph(recentVisitorsDiv, visitorsData, {
                        ylabel: 'Users',
                        title: 'Unique visitors per day',
                        dateFormat: DAY_FORMAT
                    });
                    METRICS.analyticsGraph.createGraph(recentDownloadsDiv, downloadsData, {
                        ylabel : 'Downloads',
                        title : 'Downloads per day',
                        dateFormat : DAY_FORMAT
                    });
                })
                .fail(function (response) {
                    recentSessionsDiv.innerHTML = response.responseJSON.error.message;
                });
        });
})();
