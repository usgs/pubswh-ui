/* jslint brower: true */
/* global METRICS */
/* global gapi */
/* global CONFIG */


(function() {
	"use strict";

	gapi.analytics.ready(function() {
		var recentSessionsDiv = document.getElementById('recent-sessions-container');
		var yearSessionsDiv = document.getElementById('year-sessions-container');
		var recentUsersDiv = document.getElementById('recent-users-container');
		var yearUsersDiv = document.getElementById('year-users-container');
		var recentPageviewsDiv = document.getElementById('recent-pageviews-container');
		var yearPageviewsDiv = document.getElementById('year-pageviews-container');
		var recentDownloadeventsDiv = document.getElementById('recent-downloadevents-container');
		var yearDownloadeventsDiv = document.getElementById('year-downloadevents-container');

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
				METRICS.analyticsGraph.drawLast30Days(
					recentSessionsDiv,
					results.rows,
					['Sessions'],
					'Visitors per day'
				);
			})
			.catch(function(response) {
				recentSessionsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSessionsDiv,
					results.rows,
					['Sessions'],
					'Visitors per month'
				);
			})
			.catch(function(response) {
				yearSessionsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:users')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentUsersDiv,
					results.rows,
					['Users'],
					'Unique visitors per day'
				);
			})
			.catch(function(response) {
				recentUsersDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:users')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearUsersDiv,
					results.rows,
					['Users'],
					'Unique visitors per month'
				);
			})
			.catch(function(response) {
				yearUsersDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:pageviews')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentPageviewsDiv,
					results.rows,
					['Page Views'],
					'Page views per day'
				);
			})
			.catch(function(response) {
				recentPageviewsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:pageviews')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearPageviewsDiv,
					results.rows,
					['Page Views'],
					'Page views per month'
				);
			})
			.catch(function(response) {
				yearPageviewsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:totalEvents', 'ga:eventCategory==Downloads')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentDownloadeventsDiv,
					results.rows,
					['Downloads'],
					'Downloads per day'
				);
			})
			.catch(function(response) {
				recentDownloadeventsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:totalEvents', 'ga:eventCategory==Downloads')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearDownloadeventsDiv,
					results.rows,
					['Downloads'],
					'Downloads per month'
				);
			})
			.catch(function(response) {
				yearDownloadeventsDiv.innerHTML = response.error.message;
			});
	});
})();