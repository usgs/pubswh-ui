import partial from 'lodash/partial';

import { createGraph } from './analyticsGraph';
import { createTable } from './analyticsTable';
import { batchFetchMonthlyPastYear, batchFetchPast30Days } from './analyticsData.js';


const DAY_FORMAT = 'MMM DD YYYY';
const MONTH_FORMAT = 'MMM YYYY';

let recentSessionsDiv = document.getElementById('recent-sessions-container');
let yearSessionsDiv = document.getElementById('year-sessions-container');
let recentUsersDiv = document.getElementById('recent-users-container');
let yearUsersDiv = document.getElementById('year-users-container');
let recentPageviewsDiv = document.getElementById('recent-pageviews-container');
let yearPageviewsDiv = document.getElementById('year-pageviews-container');
let recentDownloadeventsDiv = document.getElementById('recent-downloadevents-container');
let yearDownloadeventsDiv = document.getElementById('year-downloadevents-container');

let $recentSessionsTable = $('#recent-sessions-table');
let $recentUsersTable = $('#recent-users-table');
let $recentPageviewsTable = $('#recent-pageviews-table');
let $recentDownloadeventsTable = $('#recent-downloadevents-table');
let $yearSessionsTable = $('#year-sessions-table');
let $yearUsersTable = $('#year-users-table');
let $yearPageviewsTable = $('#year-pageviews-table');
let $yearDownloadeventsTable = $('#year-downloadevents-table');

const sessionsMetric = {expression: 'ga:sessions'};
const visitorsMetric = {expression: 'ga:users'};
const pageviewsMetric = {expression: 'ga:pageviews'};
const downloadsMetric = {expression: 'ga:totalEvents'};

let allGraphs = [];

const downloadsEventFilter = {
    dimensionName : 'ga:eventCategory',
    operator: 'EXACT',
    expressions: ['Downloads']
};

const metricsAndDimFilters = [
    {
        metrics: [sessionsMetric],
        dimFilters : []
    }, {
        metrics: [visitorsMetric],
        dimFilters: []
    },{
        metrics:[pageviewsMetric],
        dimFilters: []
    }, {
        metrics:[downloadsMetric],
        dimFilters : [{filters: [downloadsEventFilter]}]
    }
];

const transformToGraphData = function(metricName, row) {
    return [row.date.toDate(), parseInt(row[metricName])];
};
const transformToSessionsData = partial(transformToGraphData, sessionsMetric.expression);
const transformToVisitorsData = partial(transformToGraphData, visitorsMetric.expression);
const transformToPageviewsData = partial(transformToGraphData, pageviewsMetric.expression);
const transformToDownloadsData = partial(transformToGraphData, downloadsMetric.expression);

const monthlyDataPromise = batchFetchMonthlyPastYear(metricsAndDimFilters);


/*
 * Creates the year displays
 * @param {Array of Object} data returned from the fetch for analytics data
 * @returns {Array of Dygraphs} - return dygraphs that were created.
 */
const createYearDisplays = function(data) {
    let sessionsData = data[0].map(transformToSessionsData);
    let visitorsData = data[1].map(transformToVisitorsData);
    let pageviewsData = data[2].map(transformToPageviewsData);
    let downloadsData = data[3].map(transformToDownloadsData);

    let graphs = [];

    graphs.push(createGraph(yearSessionsDiv, sessionsData, {
        ylabel: 'Sessions',
        title: 'Visitors per month',
        dateFormat: MONTH_FORMAT
    }));
    graphs.push(createGraph(yearUsersDiv, visitorsData, {
        ylabel: 'Users',
        title: 'Unique visitors per month',
        dateFormat: MONTH_FORMAT
    }));
    graphs.push(createGraph(yearPageviewsDiv, pageviewsData, {
        ylabel: 'Page views',
        title: 'Page views per month',
        dateFormat: MONTH_FORMAT
    }));
    graphs.push(createGraph(yearDownloadeventsDiv, downloadsData, {
        ylabel: 'Downloads',
        title: 'Downloads per month',
        dateFormat: MONTH_FORMAT
    }));

    createTable($yearSessionsTable, sessionsData, {
        columnLabel: 'Visitors per month',
        dateFormat: MONTH_FORMAT
    });
    createTable($yearUsersTable, downloadsData, {
        columnLabel: 'Unique visitors per month',
        dateFormat: MONTH_FORMAT
    });
    createTable($yearPageviewsTable, pageviewsData, {
        columnLabel: 'Page views per month',
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
    let pageviewsData = data[2].map(transformToPageviewsData);
    let downloadsData = data[3].map(transformToDownloadsData);

    let graphs = [];

    graphs.push(createGraph(recentSessionsDiv, sessionsData, {
        ylabel: 'Sessions',
        title: 'Visitors per day',
        dateFormat: DAY_FORMAT
    }));
    graphs.push(createGraph(recentUsersDiv, visitorsData, {
        ylabel: 'Users',
        title: 'Unique visitors per day',
        dateFormat: DAY_FORMAT
    }));
    graphs.push(createGraph(recentPageviewsDiv, pageviewsData, {
        ylabel: 'Page views',
        title: 'Page views per day',
        dateFormat: DAY_FORMAT
    }));
    graphs.push(createGraph(recentDownloadeventsDiv, downloadsData, {
        ylabel: 'Downloads',
        title: 'Downloads per day',
        dateFormat: DAY_FORMAT
    }));

    createTable($recentSessionsTable, sessionsData, {
        columnLabel: 'Visitors per day',
        dateFormat: DAY_FORMAT
    });
    createTable($recentUsersTable, downloadsData, {
        columnLabel: 'Unique visitors per day',
        dateFormat: DAY_FORMAT
    });
    createTable($recentPageviewsTable, pageviewsData, {
        columnLabel: 'Page views per day',
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
            .done(function(data) {
                allGraphs = allGraphs.concat(createMonthDisplays(data));
            })
            .fail(function(response) {
                recentSessionsDiv.innertHTML = response.responseJSON.error.message;
            });
    });
