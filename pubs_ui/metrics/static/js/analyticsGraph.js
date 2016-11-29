/* jslint browser: true */
/* global Dygraph */
/* global moment */
/* global _ */

var METRICS = METRICS || {};

METRICS.analyticsGraph = (function() {
	"use strict";

	var self = {};

	/*
	 * Creates a graph of data
	 * @param {HTML Element or String} el - Can be an HTML Element for a div or an id for a div
	 * @param {Array of Array} rows -  where the first element is a moment and the second element is the data to be graphed.
	 * @param {Object} options - Optional
	 * 		@prop {String} ylabel - label used for the y data
	 * 		@prop {String} title - title of the graph
	 * 		@prop {String} dateFormat - String representing the formatting for the date axis. Will feed the moment
	 * 		library's format function.
	 */
	self.createGraph = function(el, rows, options) {
		var thisOptions = (options) ? options : {};
		var labels = ['Date', _.has(thisOptions, 'ylabel') ? thisOptions.ylabel : ''];
		var format = _.has(thisOptions, 'dateFormat') ? thisOptions.dateFormat : 'MM/DD/YYYY';

		var graph = new Dygraph(
			el,
			rows,
			{
				drawPoints : true,
				pointSize : 4,
				strokeWidth: 2,
				drawGrid : false,
				includeZero : true,
				fillGraph : true,
				title : _.has(thisOptions, 'title') ? thisOptions.title : '',
				valueFormatter : function(value, valueOptions, seriesName) {
					if (seriesName === 'Date') {
						return moment(value).format(format);
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
							// Only show whole numbers on the y axis
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
