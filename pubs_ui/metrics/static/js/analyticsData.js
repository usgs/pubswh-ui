/* jslint browser: true */
/* global gapi */
/* global Promise */
/* global moment */
/* global CONFIG */

var METRICS = METRICS || {};
METRICS.analyticsData = (function() {
	"use strict";
	var self = {};

	self.fetch = function(query) {
		return new Promise(function(resolve, reject) {
			var data = new gapi.analytics.report.Data({query: query});
			data.once('success', function(response) {
				resolve(response);
			}).once('error', function(response) {
				reject(response);
			}).execute();
		});
	};

	self.fetchLast30Days = function(metrics, filters) {
		var options = {
			'ids': CONFIG.VIEW_ID,
			'start-date': '30daysAgo',
			'end-date': 'yesterday',
			'metrics': metrics,
			'dimensions': 'ga:date'
		};
		if (filters) {
			options.filters = filters;
		}
		return self.fetch(options);
	};

	self.fetchMonthlyPastYear = function(metrics, filters) {
		var lastMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
		var yearAgo = moment(lastMonth).subtract(1, 'years').add(1, 'days').format('YYYY-MM-DD');
		var options = {
			'ids': CONFIG.VIEW_ID,
			'start-date': yearAgo,
			'end-date': lastMonth,
			'metrics': metrics,
			'dimensions': 'ga:yearMonth'
		};
		if (filters) {
			options.filters = filters;
		}
		return self.fetch(options);
	};

	return self;
})();
