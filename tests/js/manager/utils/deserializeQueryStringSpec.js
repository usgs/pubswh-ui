/* jslint browser: true */
/* global define */
/* global describe, it, expect */

define([
	'utils/deserializeQueryString'
], function(deserializeQueryString) {
	"use strict";

	describe('utils/deserializeQueryString', function() {
		it('Expects a null string to return an empty object', function() {
			expect(deserializeQueryString('')).toEqual({});
		});

		it('Expects a single key/value pair if the string only contains one', function() {
			expect(deserializeQueryString('param1=value1')).toEqual({param1 : ['value1']});
		});

		it('Expects two key/value pairs in the string to return an object with two keys', function() {
			var result = deserializeQueryString('param1=value1&param2=value2');
			expect(result.param1).toEqual(['value1']);
			expect(result.param2).toEqual(['value2']);
		});

		it('Expects two repeated keys to yield an array of two values for that key', function() {
			var result = deserializeQueryString('param1=value1&param2=value2&param1=value3');
			expect(result.param1).toEqual(['value1', 'value3']);
			expect(result.param2).toEqual(['value2'])
		});
	});
});