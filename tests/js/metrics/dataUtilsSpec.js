/* jslint browser: true */
/* global METRICS */
/* global describe, it, expect, beforeEach, spyOn */
/* global moment */

describe('METRICS/dataUtils', function() {
	"use strict";

	describe('Tests for convertDayToDate', function() {
		it('Expects to return the correct date for a day dimension', function() {
			var result = METRICS.dataUtils.convertDayToDate('20150316');

			expect(result instanceof Date).toBe(true);
			expect(moment(result).format('YYYY-MM-DD')).toEqual('2015-03-16');
		});
	});

	describe('Tests for convertMonthToDate', function() {
		it('Expects to return the correct date for a month dimension', function() {
			var result = METRICS.dataUtils.convertMonthToDate('201503');

			expect(result instanceof Date).toBe(true);
			expect(moment(result).format('YYYY-MM')).toEqual('2015-03');
		});
	});

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

	describe('Tests for fillMissingValues', function() {
		it('Expects a set of rows with no missing times to return the passed in array of rows', function() {
			var rows = [
					{date: moment('200212', 'YYYYMM'), graphRow: ['200212', 2]},
					{date: moment('200301', 'YYYYMM'), graphRow: ['200301', 3]},
					{date: moment('200302', 'YYYYMM'), graphRow: ['200302', 4]},
					{date: moment('200303', 'YYYYMM'), graphRow: ['200303', 5]},
					{date: moment('200304', 'YYYYMM'), graphRow: ['200304', 6]}
			];

			var result = METRICS.dataUtils.fillMissingValues({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result[0]).toEqual(rows[0].graphRow);
			expect(result[1]).toEqual(rows[1].graphRow);
			expect(result[2]).toEqual(rows[2].graphRow);
			expect(result[3]).toEqual(rows[3].graphRow);
			expect(result[4]).toEqual(rows[4].graphRow);
		});

		it('Expects a set of rows with missing times to have a filled in array of rows', function() {
			var rows = [
					{date: moment('200212', 'YYYYMM'), graphRow: ['200212', 2]},
					{date: moment('200301', 'YYYYMM'), graphRow: ['200301', 3]},
					{date: moment('200303', 'YYYYMM'), graphRow: ['200303', 5]},
					{date: moment('200304', 'YYYYMM'), graphRow: ['200304', 6]}
			];

			var result = METRICS.dataUtils.fillMissingValues({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result[0]).toEqual(rows[0].graphRow);
			expect(result[1]).toEqual(rows[1].graphRow);
			expect(result[2]).toEqual(['200302', 0]);
			expect(result[3]).toEqual(rows[2].graphRow);
			expect(result[4]).toEqual(rows[3].graphRow);
		});

		it('Expects a set of rows to return a populated array of rows with zero as the data value', function() {
			var result = METRICS.dataUtils.fillMissingValues({
				startDate: moment('2002-12', 'YYYY-MM'),
				endDate: moment('2003-04', 'YYYY-MM'),
				timeUnit: 'month',
				rows: []
			});

			expect(result.length).toBe(5);
		});

		it('Expects day dimension to work', function() {
			var rows = [
					{date: moment('20021231', 'YYYYMMDD'), graphRow: ['20021231', 2]},
					{date: moment('20030101', 'YYYYMMDD'), graphRow: ['20030101', 3]},
					{date: moment('20030103', 'YYYYMMDD'), graphRow: ['20030103', 5]},
					{date: moment('20030104', 'YYYYMMDD'), graphRow: ['20030104', 6]}
			];

			var result = METRICS.dataUtils.fillMissingValues({
				startDate: moment('2002-12-31', 'YYYY-MM-DD'),
				endDate: moment('2003-01-04', 'YYYY-MM-DD'),
				timeUnit: 'day',
				rows: rows
			});

			expect(result.length).toBe(5);
			expect(result[0]).toEqual(rows[0].graphRow);
			expect(result[1]).toEqual(rows[1].graphRow);
			expect(result[2]).toEqual(['20030102', 0]);
			expect(result[3]).toEqual(rows[2].graphRow);
			expect(result[4]).toEqual(rows[3].graphRow);
		});
	});


});
