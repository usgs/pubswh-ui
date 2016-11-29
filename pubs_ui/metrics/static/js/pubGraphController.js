/* jslint browser: true */
/* global METRICS */
/* global CONFIG */
/* global _ */

(function() {
	"use strict";

	var DAY_FORMAT = 'MMM DD YYYY';
	var MONTH_FORMAT = 'MMM YYYY';

	var pageURI = '/publication/' + CONFIG.PUBSID;

	var yearSessionsDiv = document.getElementById('year-sessions-container');
	var recentSessionsDiv = document.getElementById('recent-sessions-container');
	var yearVisitorsDiv = document.getElementById('year-visitors-container');
	var recentVisitorsDiv = document.getElementById('recent-visitors-container');

	var sessionsMetric = {expression : 'ga:sessions'};
	var visitorsMetric = {expression: 'ga:users'};
	var pageFilter = {
		dimensionName : 'ga:pagePath',
		operator : 'EXACT',
		expressions : [pageURI]
	};
	var metrics = [sessionsMetric, visitorsMetric];
	var dimensionFilters = {
		filters: [pageFilter]
	};

	var transformToGraphData = function(metricName, row) {
		return [row.date.toDate(), parseInt(row[metricName])];
	};
	var transformToSessionsData = _.partial(transformToGraphData, sessionsMetric.expression);
	var transformToVisitorsData = _.partial(transformToGraphData, visitorsMetric.expression);

	var monthlyDataPromise = METRICS.analyticsData.batchFetchMonthlyPastYear(metrics, dimensionFilters);

	monthlyDataPromise
		.done(function(rows) {
			var sessionsData = rows.map(transformToSessionsData);
			var visitorsData = rows.map(transformToVisitorsData);

			METRICS.analyticsGraph.createGraph(yearSessionsDiv, sessionsData, {
				ylabel : 'Sessions',
				title : 'Sessions for ' + pageURI,
				dateFormat : MONTH_FORMAT
			});
			METRICS.analyticsGraph.createGraph(yearVisitorsDiv, visitorsData, {
				ylabel : 'Visitors',
				title : 'Visitors for ' + pageURI,
				dateFormat : MONTH_FORMAT
			});
		})
		.fail(function(response) {
			yearSessionsDiv.innerHTML = response.responseJSON.error.message;
		})
		.always(function() {
			METRICS.analyticsData.batchFetchPast30Days(metrics, dimensionFilters)
				.done(function (rows) {
					var sessionsData = _.map(rows, transformToSessionsData);
					var visitorsData = _.map(rows, transformToVisitorsData);

					METRICS.analyticsGraph.createGraph(recentSessionsDiv, sessionsData, {
						ylabel: 'Sessions',
						title: 'Sessions for ' + pageURI,
						dateFormat: DAY_FORMAT
					});
					METRICS.analyticsGraph.createGraph(recentVisitorsDiv, visitorsData, {
						ylabel: 'Visitors',
						title: 'Visitors for ' + pageURI,
						dateFormat: DAY_FORMAT
					});
				})
				.fail(function (response) {
					recentSessionsDiv.innerHTML = response.responseJSON.error.message;
				});
		});
})();
