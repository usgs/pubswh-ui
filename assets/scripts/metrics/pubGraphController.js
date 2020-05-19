import partial from 'lodash/partial';

import { batchFetchMonthlyPastYear, batchFetchPast30Days } from './analyticsData.js';
import { createGraph } from './analyticsGraph';
import { createTable } from './analyticsTable';


const DAY_FORMAT = 'MMM DD YYYY';
const MONTH_FORMAT = 'MMM YYYY';

const pageURI = '/publication/' + CONFIG.PUBSID;

let yearSessionsDiv = document.getElementById('year-sessions-container');
let recentSessionsDiv = document.getElementById('recent-sessions-container');
let yearVisitorsDiv = document.getElementById('year-visitors-container');
let recentVisitorsDiv = document.getElementById('recent-visitors-container');
let yearDownloadsDiv = document.getElementById('year-downloads-container');
let recentDownloadsDiv = document.getElementById('recent-downloads-container');

let $recentSessionsTable = $('#recent-sessions-table');
let $recentUsersTable = $('#recent-users-table');
let $recentDownloadeventsTable = $('#recent-downloadevents-table');
let $yearSessionsTable = $('#year-sessions-table');
let $yearUsersTable = $('#year-users-table');
let $yearDownloadeventsTable = $('#year-downloadevents-table');

let allGraphs = [];

const sessionsMetric = {expression : 'ga:sessions'};
const visitorsMetric = {expression: 'ga:users'};
const downloadsMetric = {expression: 'ga:totalEvents'};
const pageFilter = {
    dimensionName : 'ga:pagePath',
    operator : 'EXACT',
    expressions : [pageURI]
};
const downloadsEventFilter = {
    dimensionName : 'ga:eventCategory',
    operator: 'EXACT',
    expressions: ['Downloads']
};
const metricsAndDimFilters = [
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

const transformToGraphData = function(metricName, row) {
    return [row.date.toDate(), parseInt(row[metricName])];
};
const transformToSessionsData = partial(transformToGraphData, sessionsMetric.expression);
const transformToVisitorsData = partial(transformToGraphData, visitorsMetric.expression);
const transformToDownloadsData = partial(transformToGraphData, downloadsMetric.expression);

// When the two calls to GA where made simultaneously, frequently only one of the calls worked.
// Therefore, we are waiting until the first call returns before making the second request.
const monthlyDataPromise = batchFetchMonthlyPastYear(metricsAndDimFilters);


/*
 * Creates the year displays
 * @param {Array of Object} data returned from the fetch for analytics data
 * @returns {Array of Dygraphs} - return dygraphs that were created.
 */
const createYearDisplays = function(data) {
    let sessionsData = data[0].map(transformToSessionsData);
    let visitorsData = data[1].map(transformToVisitorsData);
    let downloadsData = data[2].map(transformToDownloadsData);

    let graphs = [];

    graphs.push(createGraph(yearSessionsDiv, sessionsData, {
        ylabel: 'Sessions',
        title: 'Visitors per month',
        dateFormat: MONTH_FORMAT
    }));
    graphs.push(createGraph(yearVisitorsDiv, visitorsData, {
        ylabel: 'Users',
        title: 'Unique visitors per month',
        dateFormat: MONTH_FORMAT
    }));
    graphs.push(createGraph(yearDownloadsDiv, downloadsData, {
        ylabel: 'Downloads',
        title: 'Downloads per month',
        dateFormat: MONTH_FORMAT
    }));

    createTable($yearSessionsTable, sessionsData, {
        columnLabel: 'Visitors per month',
        dateFormat: MONTH_FORMAT
    });
    createTable($yearUsersTable, visitorsData, {
        columnLabel: 'Unique visitors per month',
        dateFormat: MONTH_FORMAT
    });
    createTable($yearDownloadeventsTable, downloadsData, {
        columnLabel: 'Downloads per month',
        dateFormat: MONTH_FORMAT
    });

    return graphs;
};

/*
 * Creates the month displays
 * @param {Array of Object} data returned from the fetch for analytics data
 * @returns {Array of Dygraphs} - return dygraphs that were created.
 */
const createMonthDisplays = function(data) {
    let sessionsData = data[0].map(transformToSessionsData);
    let visitorsData = data[1].map(transformToVisitorsData);
    let downloadsData = data[2].map(transformToDownloadsData);

    let graphs = [];

    graphs.push(createGraph(recentSessionsDiv, sessionsData, {
        ylabel: 'Sessions',
        title: 'Visitors per day',
        dateFormat: DAY_FORMAT
    }));
    graphs.push(createGraph(recentVisitorsDiv, visitorsData, {
        ylabel: 'Users',
        title: 'Unique visitors per day',
        dateFormat: DAY_FORMAT
    }));
    graphs.push(createGraph(recentDownloadsDiv, downloadsData, {
        ylabel : 'Downloads',
        title : 'Downloads per day',
        dateFormat : DAY_FORMAT
    }));

    createTable($recentSessionsTable, sessionsData, {
        columnLabel: 'Visitors per day',
        dateFormat: DAY_FORMAT
    });
    createTable($recentUsersTable, downloadsData, {
        columnLabel: 'Unique visitors per day',
        dateFormat: DAY_FORMAT
    });
    createTable($recentDownloadeventsTable, downloadsData, {
        columnLabel: 'Downloads per day',
        dateFormat: DAY_FORMAT
    });

    return graphs;
};

$('input[name="display-style"]').click((ev) => {
    let $chartDiv = $('.chart-display');
    let $tableDiv = $('.table-display');
    if ($(ev.currentTarget).val() === 'chart') {
        $chartDiv.show();
        $tableDiv.hide();
        allGraphs.forEach((graph) => graph.resize());
    } else {
        $chartDiv.hide();
        $tableDiv.show();
    }
});

monthlyDataPromise
    .done(function(data) {
        allGraphs = allGraphs.concat(createYearDisplays(data));
    })
    .fail(function(response) {
        yearSessionsDiv.innerHTML = response.responseJSON.error.message;
    })
    .always(function() {
        batchFetchPast30Days(metricsAndDimFilters)
            .done(function (data) {
                allGraphs = allGraphs.concat(createMonthDisplays(data));
            })
            .fail(function (response) {
                recentSessionsDiv.innerHTML = response.responseJSON.error.message;
            });
    });
