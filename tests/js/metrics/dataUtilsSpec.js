/* jslint browser: true */
/* global METRICS */
/* global describe, it, expect, beforeEach, spyOn */
/* global moment */

describe('METRICS/dataUtils', function() {
	"use strict";

	describe('Tests for getPastYear', function() {
		it('Expects that the if the passed in date is the first of November the returned array includes the previous November through October', function() {
			var result = METRICS.dataUtils.getPastYear(moment('2010-11-01', 'YYYY-MM-DD'));

			expect(result[0].format('YYYY-MM-DD')).toEqual('2009-11-01');
			expect(result[1].format('YYYY-MM-DD')).toEqual('2010-10-31');
		});

		it('Expects that if the passed in date is the last of November, the returned array includes the previous November through October', function() {
			var result = METRICS.dataUtils.getPastYear(moment('2010-11-30', 'YYYY-MM-DD'));

			expect(result[0].format('YYYY-MM-DD')).toEqual('2009-11-01');
			expect(result[1].format('YYYY-MM-DD')).toEqual('2010-10-31');
		});
	});

	describe('Tests for fillMissingDates', function() {
		it('Expects a set of rows with no missing times to return the passed in array of rows', function() {
			var rows = [
					{date: moment('200212', 'YYYYMM'), 'ga:metric': '2'},
					{date: moment('200301', 'YYYYMM'), 'ga:metric': '3'},
					{date: moment('200302', 'YYYYMM'), 'ga:metric': '4'},
					{date: moment('200303', 'YYYYMM'), 'ga:metric': '5'},
					{date: moment('200304', 'YYYYMM'), 'ga:metric': '6'}
			];

			var result = METRICS.dataUtils.fillMissingDates({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				metricNames : ['ga:metric'],
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result).toEqual(rows);
		});

		it('Expects a set of rows with missing times to have a filled in array of rows', function() {
			var rows = [
					{date: moment('200212', 'YYYYMM'), 'ga:metric': '2'},
					{date: moment('200301', 'YYYYMM'), 'ga:metric': '3'},
					{date: moment('200303', 'YYYYMM'), 'ga:metric': '5'},
					{date: moment('200304', 'YYYYMM'), 'ga:metric': '6'}
			];

			var result = METRICS.dataUtils.fillMissingDates({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				metricNames: ['ga:metric'],
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result[0]).toEqual(rows[0]);
			expect(result[1]).toEqual(rows[1]);
			expect(result[2].date.format('YYYYMM')).toEqual('200302');
			expect(result[2]['ga:metric']).toEqual('0');
			expect(result[3]).toEqual(rows[2]);
			expect(result[4]).toEqual(rows[3]);
		});

		it('Expects a set of rows to return a populated array of rows with zero as the data value', function() {
			var result = METRICS.dataUtils.fillMissingDates({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				metricNames: ['ga:onemetric', 'ga:twometric'],
				rows: []
			});

			var expectedResult = function(row, date) {
				return (row.date.format('YYYYMM') === date) &&
					(row['ga:onemetric'] === '0') &&
					(row['ga:twometric'] === '0');
			}

			expect(result.length).toBe(5);
			expect(expectedResult(result[0], '200212')).toBe(true);
			expect(expectedResult(result[1], '200301')).toBe(true);
			expect(expectedResult(result[2], '200302')).toBe(true);
			expect(expectedResult(result[3], '200303')).toBe(true);
			expect(expectedResult(result[4], '200304')).toBe(true);
		});

		it('Expects day dimension to work', function() {
			var rows = [
					{date: moment('20021231', 'YYYYMMDD'), 'ga:metric' : '2'},
					{date: moment('20030101', 'YYYYMMDD'), 'ga:metric' : '3'},
					{date: moment('20030103', 'YYYYMMDD'), 'ga:metric' : '5'},
					{date: moment('20030104', 'YYYYMMDD'), 'ga:metric' : '6'}
			];

			var result = METRICS.dataUtils.fillMissingDates({
				startDate: moment('2002-12-31', 'YYYY-MM-DD'),
				endDate: moment('2003-01-04', 'YYYY-MM-DD'),
				timeUnit: 'day',
				metricNames : ['ga:metric'],
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result[0]).toEqual(rows[0]);
			expect(result[1]).toEqual(rows[1]);
			expect(result[2].date.format('YYYYMMDD')).toEqual('20030102');
			expect(result[2]['ga:metric']).toEqual('0');
			expect(result[3]).toEqual(rows[2]);
			expect(result[4]).toEqual(rows[3]);
		});
	});


});
