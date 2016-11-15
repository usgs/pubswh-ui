/* jslint browser: true */
/* global gapi */
/* global Promise */
/* global moment */
/* global CONFIG */
/* global $ */

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
		var dateRange = METRICS.dataUtils.getPastYear(moment());
		var options = {
			'ids': CONFIG.VIEW_ID,
			'start-date': dateRange[0].format('YYYY-MM-DD'),
			'end-date': dateRange[1].format('YYYY-MM-DD'),
			'metrics': metrics,
			'dimensions': 'ga:yearMonth'
		};
		if (filters) {
			options.filters = filters;
		}
		return self.fetch(options);
	};

	/*
	 * 	@param {Array of Metric} metrics - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#metric}
	 *	@param {DimensionFilterClause} dimensionFilters - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#dimensionfilterclause
	 *	@returns Jquery Promise
	 *		@resolve - successfully retrieval. Response is {Array of Array} representing the data.
	 *			First element is a moment, the rest is the data requested via the metrics parameter.
	 *		@reject - somethings went wrong - returns response. The responseJSON.error.message can be used to determine
	 *			why the request failed.
	 */
	self.batchFetchMonthlyPastYear = function(metrics, dimensionFilters) {
		var dateRange = METRICS.dataUtils.getPastYear(moment());
		var deferred = $.Deferred();
		$.ajax({
			url : CONFIG.JSON_LD_ID_BASE_URL + 'metrics/gadata/',
			method: 'POST',
			contentType : 'application/json',
			data : JSON.stringify([
				{
					dateRanges : [{
						startDate : dateRange[0].format('YYYY-MM-DD'),
						endDate : dateRange[1].format('YYYY-MM-DD')
					}],
					dimensions : [{name: 'ga:yearMonth'}],
					metrics : metrics,
					dimensionFilterClauses : dimensionFilters
				}
			]),
			success: function(response) {
				var rows = response.reports[0].data.rows.map(function (row) {
					return {date: moment(row.dimensions[0], 'YYYYMM'), graphRow : [row.dimensions[0], row.metrics[0].values[0]]};
				});
				deferred.resolve(METRICS.dataUtils.fillMissingValues({
					startDate : dateRange[0],
					endDate : dateRange[1],
					timeUnit : 'month',
					rows : rows
				}));
			},
			error : function(jqXHR) {
				deferred.reject(jqXHR);
			},
			processData : false
		});

		return deferred;
	};

	return self;
})();
