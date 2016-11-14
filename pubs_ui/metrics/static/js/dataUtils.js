/* jslint browser: true */
/* global moment */

var METRICS = METRICS || {};

METRICS.dataUtils = (function() {
	"use strict";

	var TIME_DIMENSION_FORMAT = {
		'year' : 'YYYY',
		'month' : 'YYYYMM',
		'day' : 'YYYYMMDD'
	}
	var self = {};

	self.convertDayToDate = function(dayIndex) {
		return moment(dayIndex, 'YYYYMMDD').toDate();
	};

	self.convertMonthToDate = function(monthIndex) {
		return moment(monthIndex, 'YYYYMM').toDate();
	};

	/*
	 * @parm {moment} forMoment
	 * @returns {Array of two moments} - The function returns an array where the first element
	 * is a year before the last fullMonth before forMoment
	 * and the second element is the last full month before for Moment
	 */
	self.getPastYear = function(forMoment) {
		var lastMonth = forMoment.subtract(1, 'months').endOf('month');
		var yearAgo = moment(lastMonth).subtract(1, 'years').add(1, 'days');
		return [yearAgo, lastMonth];
	};

	/*
	 * @param {Object} - options
	 * 		@prop {Moment} startDate
	 * 		@prop {Moment} endDate
	 * 		@prop {String} timeUnit - year, month, day that we are processing
	 *		@prop {Array of {Object} rows
	 *			@prop {moment} date
	 *			@prop {two element array, [time dimension, data]} graphrow
	 *			First element is a moment . Second element is the data value
	 * @return {Array of Array} - Should be rows with all missing time dimensions filled in with zero. The times should
	 * 		go from startDate to endDate
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
				result.push([currentDate.format(TIME_DIMENSION_FORMAT[options.timeUnit]), 0]);
			}
			currentDate.add(1, options.timeUnit + 's');
		}
		return result;
	};

	return self;
})();