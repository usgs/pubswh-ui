/* jslint brower: true */
/* global _ */
/* global METRICS */
/* global gapi */
/* global CONFIG */

require('./analyticsData.js');
require('./analyticsGraph.js');
require('./dataUtils.js');

(function() {
	'use strict';

	var DAY_FORMAT = 'MMM DD YYYY';
	var MONTH_FORMAT = 'MMM YYYY';

	var recentSessionsDiv = document.getElementById('recent-sessions-container');
	var yearSessionsDiv = document.getElementById('year-sessions-container');
	var recentUsersDiv = document.getElementById('recent-users-container');
	var yearUsersDiv = document.getElementById('year-users-container');
	var recentPageviewsDiv = document.getElementById('recent-pageviews-container');
	var yearPageviewsDiv = document.getElementById('year-pageviews-container');
	var recentDownloadeventsDiv = document.getElementById('recent-downloadevents-container');
	var yearDownloadeventsDiv = document.getElementById('year-downloadevents-container');

	var sessionsMetric = {expression: 'ga:sessions'};
	var visitorsMetric = {expression: 'ga:users'};
	var pageviewsMetric = {expression: 'ga:pageviews'};
	var downloadsMetric = {expression: 'ga:totalEvents'};

	var downloadsEventFilter = {
		dimensionName : 'ga:eventCategory',
		operator: 'EXACT',
		expressions: ['Downloads']
	};

	var metricsAndDimFilters = [
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

	var transformToGraphData = function(metricName, row) {
		return [row.date.toDate(), parseInt(row[metricName])];
	};
	var transformToSessionsData = _.partial(transformToGraphData, sessionsMetric.expression);
	var transformToVisitorsData = _.partial(transformToGraphData, visitorsMetric.expression);
	var transformToPageviewsData = _.partial(transformToGraphData, pageviewsMetric.expression);
	var transformToDownloadsData = _.partial(transformToGraphData, downloadsMetric.expression);

	var monthlyDataPromise = METRICS.analyticsData.batchFetchMonthlyPastYear(metricsAndDimFilters);

	monthlyDataPromise
		.done(function(data) {
			var sessionsData = data[0].map(transformToSessionsData);
			var visitorsData = data[1].map(transformToVisitorsData);
			var pageviewsData = data[2].map(transformToPageviewsData);
			var downloadsData = data[3].map(transformToDownloadsData);

			METRICS.analyticsGraph.createGraph(yearSessionsDiv, sessionsData, {
				ylabel: 'Sessions',
				title: 'Visitors per month',
				dateFormat: MONTH_FORMAT
			});
			METRICS.analyticsGraph.createGraph(yearUsersDiv, visitorsData, {
				ylabel: 'Users',
				title: 'Unique visitors per month',
				dateFormat: MONTH_FORMAT
			});
			METRICS.analyticsGraph.createGraph(yearPageviewsDiv, pageviewsData, {
				ylabel: 'Page views',
				title: 'Page views per month',
				dateFormat: MONTH_FORMAT
			});
			METRICS.analyticsGraph.createGraph(yearDownloadeventsDiv, downloadsData, {
				ylabel: 'Downloads',
				title: 'Downloads per month',
				dateFormat: MONTH_FORMAT
			});
		})
		.fail(function(response) {
			yearSessionsDiv.innerHTML = response.responseJSON.error.message;
		})
		.always(function() {
			METRICS.analyticsData.batchFetchPast30Days(metricsAndDimFilters)
				.done(function(data) {
					var sessionsData = data[0].map(transformToSessionsData);
					var visitorsData = data[1].map(transformToVisitorsData);
					var pageviewsData = data[2].map(transformToPageviewsData);
					var downloadsData = data[3].map(transformToDownloadsData);

					METRICS.analyticsGraph.createGraph(recentSessionsDiv, sessionsData, {
						ylabel: 'Sessions',
						title: 'Visitors per day',
						dateFormat: DAY_FORMAT
					});
					METRICS.analyticsGraph.createGraph(recentUsersDiv, visitorsData, {
						ylabel: 'Users',
						title: 'Unique visitors per day',
						dateFormat: DAY_FORMAT
					});
					METRICS.analyticsGraph.createGraph(recentPageviewsDiv, pageviewsData, {
						ylabel: 'Page views',
						title: 'Page views per day',
						dateFormat: DAY_FORMAT
					});
					METRICS.analyticsGraph.createGraph(recentDownloadeventsDiv, downloadsData, {
						ylabel: 'Downloads',
						title: 'Downloads per day',
						dateFormat: DAY_FORMAT
					});
				})
				.fail(function(response) {
					recentSessionsDiv.innertHTML = response.responseJSON.error.message;
				});
		});
})();
