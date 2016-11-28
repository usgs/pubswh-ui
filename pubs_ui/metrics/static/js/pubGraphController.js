/* jslint browser: true */
/* global METRICS */
/* global CONFIG */

(function() {
	"use strict";

	var pageURI = '/publication/' + CONFIG.PUBSID;
	var yearSessionsDiv = document.getElementById('year-sessions-container');
	var recentSessionsDiv = document.getElementById('recent-sessions-container');

	var sessionsMetric = {expression : 'ga:sessions'};
	var pageFilter = {
		dimensionName : 'ga:pagePath',
		operator : 'EXACT',
		expressions : [pageURI]
	};
	var metrics = [sessionsMetric];
	var dimensionFilters = {
		filters: [pageFilter]
	};

	METRICS.analyticsData.batchFetchMonthlyPastYear(metrics, dimensionFilters)
		.done(function(rows) {
			METRICS.analyticsGraph.drawMonthlyPastYear(yearSessionsDiv, rows, ['Sessions'], 'Sessions for ' + pageURI);
		})
		.fail(function(response) {
			yearSessionsDiv.innerHTML = response.responseJSON.error.message;
		});

	METRICS.analyticsData.batchFetchPast30Days(metrics, dimensionFilters)
		.done(function(rows) {
			METRICS.analyticsGraph.drawLast30Days(recentSessionsDiv, rows, ['Sessions'], 'Sessions for ' + pageURI);
		})
		.fail(function(response) {
			recentSessionsDiv.innerHTML = response.responseJSON.error.message;
		});
})();
