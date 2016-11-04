/* jslint browser: true */
/* global METRICS */
/* global gapi */
/* global CONFIG */

(function() {
	"use strict";

	gapi.analytics.ready(function() {
		var recentSearchesDiv = document.getElementById('recent-searches-container');
		var yearSearchesDiv = document.getElementById('year-searches-container');
		var recentSearchReferralsDiv = document.getElementById('recent-search-referrals-container');
		var yearSearchReferralsDiv = document.getElementById('year-search-referrals-container');
		var recentSearchDirectDiv = document.getElementById('recent-search-direct-container');
		var yearSearchDirectDiv = document.getElementById('year-search-direct-container');
		var recentSearchSocialDiv = document.getElementById('recent-search-social-container');
		var yearSearchSocialDiv = document.getElementById('year-search-social-container');
		var recentSearchEmailDiv = document.getElementById('recent-search-email-container');
		var yearSearchEmailDiv = document.getElementById('year-search-email-container');
		/**
		 * Authorize the user with an access token obtained server side.
		 */
		gapi.analytics.auth.authorize({
			'serverAuth': {
				'access_token': CONFIG.GA_ACCESS_TOKEN
			}
		});

		METRICS.analyticsData.fetchLast30Days('ga:sessions', 'ga:medium==organic')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentSearchesDiv,
					results.rows,
					['Organic Searches'],
					'Organic searches per day'
				);
			})
			.catch(function(response) {
				recentSearchesDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions', 'ga:medium==organic')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSearchesDiv,
					results.rows,
					['Organic Searches'],
					'Organic searches per month'
				);
			})
			.catch(function(response) {
				yearSearchesDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:sessions', 'ga:medium==referral')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentSearchReferralsDiv,
					results.rows,
					['Referrals Sessions'],
					'Referrals per day'
				);
			})
			.catch(function(response) {
				recentSearchReferralsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions', 'ga:medium==referral')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSearchReferralsDiv,
					results.rows,
					['Referrals'],
					'Referrals per month'
				);
			})
			.catch(function(response) {
				yearSearchReferralsDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:sessions', 'ga:source==(direct)')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentSearchDirectDiv,
					results.rows,
					['Direct Sessions'],
					'Direct sessions per day'
				);
			})
			.catch(function(response) {
				recentSearchDirectDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions', 'ga:source==(direct)')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSearchDirectDiv,
					results.rows,
					['Direct Sessions '],
					'Direct sessions per month'
				);
			})
			.catch(function(response) {
				yearSearchDirectDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:sessions', 'ga:socialNetwork==Twitter')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentSearchSocialDiv,
					results.rows,
					['Twitter Sessions'],
					'Twitter sessions per day'
				);
			})
			.catch(function(response) {
				recentSearchSocialDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions', 'ga:socialNetwork==Twitter')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSearchSocialDiv,
					results.rows,
					['Twitter Sessions '],
					'Twitter sessions per month'
				);
			})
			.catch(function(response) {
				yearSearchSocialDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchLast30Days('ga:sessions', 'ga:medium==email')
			.then(function(results) {
				METRICS.analyticsGraph.drawLast30Days(
					recentSearchEmailDiv,
					results.rows,
					['Sessions from email'],
					'Session from email per day'
				);
			})
			.catch(function(response) {
				recentSearchEmailDiv.innerHTML = response.error.message;
			});

		METRICS.analyticsData.fetchMonthlyPastYear('ga:sessions', 'ga:medium==email')
			.then(function(results) {
				METRICS.analyticsGraph.drawMonthlyPastYear(
					yearSearchEmailDiv,
					results.rows,
					['Sessions from email '],
					'Sessions from email per month'
				);
			})
			.catch(function(response) {
				yearSearchEmailDiv.innerHTML = response.error.message;
			});
	});
})();