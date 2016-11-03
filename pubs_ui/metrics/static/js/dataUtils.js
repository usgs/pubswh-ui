/* jslint browser: true */
/* global moment */

var METRICS = METRICS || {};

METRICS.dataUtils = (function() {
	"use strict";
	var self = {};

	self.convertDayToDate = function(dayIndex) {
		return moment(dayIndex, 'YYYYMMDD').toDate();
	};

	self.convertMonthToDate = function(monthIndex) {
		return moment(monthIndex, 'YYYYMM').toDate();
	};

	self.mergeGAData = function(gaDataArray) {
		var mergedData = gaDataArray[0].rows;
		gaDataArray.slice(1).forEach(function(data) {
			data.rows.forEach(function(row, index) {
				mergedData[index].push(row[1]);
			});
		});

		return mergedData;
	};

	return self;
})();