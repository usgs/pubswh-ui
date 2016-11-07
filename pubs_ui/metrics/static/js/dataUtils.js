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

	self.getPastYear = function() {
		var lastMonth = moment().subtract(1, 'months').endOf('month');
		var yearAgo = moment(lastMonth).subtract(1, 'years').add(1, 'days');
		return [yearAgo, lastMonth];
	};

	/*
	 * @param {Object} - options
	 * 		@prop {Moment} startDate
	 * 		@prop {Moment} endDate
	 * 		@prop {String} timeUnit - year, month, day
	 *		@prop {Array of data returned from ReportingAPI} rows - Each element is an array.
	 *			First element is the time dimension which should match timeUnit. Second element is the data value
	 * @return {Array of Array} - Should be rows with all missing time dimensions filled in with zero.
	 */
	self.fillMissingValues = function(options) {
		var rowIndex = 0;
		var currentDate = options.startDate;
		var result = [];

		while (currentDate.isSameOrBefore(options.endDate, options.timeUnit)) {
			if (currentDate.isSame(options.rows[rowIndex].date, options.timeUnit)) {
				result.push(options.rows[rowIndex].graphRow);
				rowIndex = rowIndex + 1;
			}
			else {
				result.push([currentDate.format('YYYYMM'), 0]);
			}
			currentDate.add(1, 'months');
		}
		return result;
	};

	return self;
})();