/* jslint browser: true */
/* global Dygraph */
/* global moment */

var METRICS = METRICS || {};

METRICS.analyticsGraph = (function() {
	"use strict";

	var self = {};

	self.drawLast30Days = function(el, dataRows, ylabels, title) {
		var labels = ['Date'].concat(ylabels);
		var data = dataRows.map(function(row) {
			return [METRICS.dataUtils.convertDayToDate(row[0]), parseInt(row[1])];
		});

		var graph = new Dygraph(
			el,
			data,
			{
				drawPoints : true,
				pointSize : 4,
				strokeWidth: 2,
				drawGrid : false,
				includeZero : true,
				fillGraph : true,
				title : title,
				valueFormatter : function(value, options, seriesName) {
					if (seriesName === 'Date') {
						return moment(value).format('MMM DD YYYY');
					}
					else {
						return value;
					}
				},
				labelsKMB : true,
				labels : labels,
				axes : {
					y: {
						axisLabelFormatter: function(y) {
							if (y % 1 === 0) {
								return y;
							}
							else {
								return '';
							}
						}
					}
				}
			}
		);
	};

	self.drawMonthlyPastYear = function(el, dataRows, ylabels, title) {
		var labels = ['Date'].concat(ylabels);
		var data = dataRows.map(function(row) {
			return [METRICS.dataUtils.convertMonthToDate(row[0]), parseInt(row[1])];
		});

		var graph = new Dygraph(
			el,
			data,
			{
				drawPoints : true,
				pointSize : 4,
				strokeWidth: 2,
				drawGrid : false,
				includeZero : true,
				fillGraph : true,
				title : title,
				valueFormatter : function(value, options, seriesName) {
					if (seriesName === 'Date') {
						return moment(value).format('MMM YYYY');
					}
					else {
						return value;
					}
				},
				labelsKMB : true,
				labels : labels,
				axes : {
					y: {
						axisLabelFormatter: function(y) {
							if (y % 1 === 0) {
								return y;
							}
							else {
								return '';
							}
						}
					}
				}
			}
		);
	};

	return self;
})();
