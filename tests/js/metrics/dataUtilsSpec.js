/* jslint browser: true */
/* global METRICS */
/* global describe, it, expect */

fdescribe('METRICS/dataUtils', function() {
	"use strict";

	describe('Tests for convertDayToDate', function() {
		it('Expects to return the correct date for a day dimension', function() {
			var result = METRICS.dataUtils.convertDayToDate('20150316');
			expect(result instanceof Date).toBe(true);
		});
	});

});
