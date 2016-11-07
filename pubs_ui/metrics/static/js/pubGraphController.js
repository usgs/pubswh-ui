/* jslint browser: true */
/* global METRICS */
/* global CONFIG */

(function() {
	"use strict";

	var yearSessionsDiv = document.getElementById('year-sessions-container');

	var sessionsMetric = {expression : 'ga:sessions'};
	var pageFilter = {
		dimensionName : 'ga:pagePath',
		operator : 'EXACT',
		expressions : ['/publication/' + CONFIG.PUBSID]
	};

	METRICS.analyticsData.batchFetchMonthlyPastYear([sessionsMetric], {filters: [pageFilter]})
		.done(function(rows) {
			METRICS.analyticsGraph.drawMonthlyPastYear(yearSessionsDiv, rows, ['Sessions'], 'Sessions for /publication/' + CONFIG.PUBSID);
		})
		.fail(function(response) {
			yearSessionsDiv.innerHTML = response.responseJSON.error.message;
		});

})();
