/* jslint brower: true */
/* global METRICS */
/* global gapi */
/* global CONFIG */


(function() {
	"use strict";

	var DAY_FORMAT = 'MMM DD YYYY';
	var MONTH_FORMAT = 'MMM YYYY';

	gapi.analytics.ready(function() {
		var recentSessionsDiv = document.getElementById('recent-sessions-container');
		var yearSessionsDiv = document.getElementById('year-sessions-container');
		var recentUsersDiv = document.getElementById('recent-users-container');
		var yearUsersDiv = document.getElementById('year-users-container');
		var recentPageviewsDiv = document.getElementById('recent-pageviews-container');
		var yearPageviewsDiv = document.getElementById('year-pageviews-container');
		var recentDownloadeventsDiv = document.getElementById('recent-downloadevents-container');
		var yearDownloadeventsDiv = document.getElementById('year-downloadevents-container');

		var transformDayData = function(row) {
			return [METRICS.dataUtils.convertDayToDate(row[0]), parseInt(row[1])];
		};
		var transformMonthlyData = function(row) {
			return [METRICS.dataUtils.convertMonthToDate(row[0]), parseInt(row[1])];
		};

		/**
		 * Authorize the user with an access token obtained server side.
		 */
		gapi.analytics.auth.authorize({
			'serverAuth': {
				'access_token': CONFIG.GA_ACCESS_TOKEN
			}
		});

		METRICS.analyticsData.fetchLast30Days('ga:sessions')
			.then(function(results) {
				var rows = results.rows.map(transformDayData);
				METRICS.analyticsGraph.createGraph(recentSessionsDiv, rows, {
					ylabel: 'Sessions',
					title : 'Visitors per day',
					dateFormat: DAY_FORMAT
				});
			})
			.catch(function(response) {
				recentSessionsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions')
			.then(function(results) {
				var rows = results.rows.map(transformMonthlyData);
				METRICS.analyticsGraph.createGraph(yearSessionsDiv, rows, {
					ylabel: 'Sessions',
					title : 'Visitors per month',
					dateFormat: MONTH_FORMAT
				});
			})
			.catch(function(response) {
				yearSessionsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:users')
			.then(function(results) {
				var rows = results.rows.map(transformDayData);
				METRICS.analyticsGraph.createGraph(recentUsersDiv, rows, {
					ylabel: 'Users',
					title : 'Unique visitors per day',
					dateFormat: DAY_FORMAT
				});
			})
			.catch(function(response) {
				recentUsersDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:users')
			.then(function(results) {
				var rows = results.rows.map(transformMonthlyData);
				METRICS.analyticsGraph.createGraph(yearUsersDiv, rows, {
					ylabel: 'Users',
					title : 'Unique visitors per month',
					dateFormat: MONTH_FORMAT
				});
			})
			.catch(function(response) {
				yearUsersDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:pageviews')
			.then(function(results) {
				var rows = results.rows.map(transformDayData);
				METRICS.analyticsGraph.createGraph(recentPageviewsDiv, rows, {
					ylabel: 'Page Views',
					title : 'Page views per day',
					dateFormat: DAY_FORMAT
				});
			})
			.catch(function(response) {
				recentPageviewsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:pageviews')
			.then(function(results) {
				var rows = results.rows.map(transformMonthlyData);
				METRICS.analyticsGraph.createGraph(yearPageviewsDiv, rows, {
					ylabel: 'Page Views',
					title : 'Page views per month',
					dateFormat: MONTH_FORMAT
				});
			})
			.catch(function(response) {
				yearPageviewsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:totalEvents', 'ga:eventCategory==Downloads')
			.then(function(results) {
				var rows = results.rows.map(transformDayData);
				METRICS.analyticsGraph.createGraph(recentDownloadeventsDiv, rows, {
					ylabel: 'Downloads',
					title : 'Downloads per day',
					dateFormat: DAY_FORMAT
				});
			})
			.catch(function(response) {
				recentDownloadeventsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:totalEvents', 'ga:eventCategory==Downloads')
			.then(function(results) {
				var rows = results.rows.map(transformMonthlyData);
				METRICS.analyticsGraph.createGraph(yearDownloadeventsDiv, rows, {
					ylabel: 'Downloads',
					title : 'Downloads per month',
					dateFormat: MONTH_FORMAT
				});
			})
			.catch(function(response) {
				yearDownloadeventsDiv.innerHTML = response.error.message;
			});
	});
})();