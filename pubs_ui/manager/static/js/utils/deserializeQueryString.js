/* jslint browser: true */
/* global define */

define([
	'underscore'
], function(_) {
	"use strict";
	var fnct = function(queryString) {
		var result = {};
		if (queryString) {
			var keyValueStrArray = queryString.split('&');
			result = _.chain(keyValueStrArray)
				.map(function(keyValueStr) {
					var splitIndex = keyValueStr.indexOf('=');
					return [keyValueStr.slice(0, splitIndex), keyValueStr.slice(splitIndex + 1)];
				})
				.groupBy(function(keyValuePair) {
					return keyValuePair[0];
				})
				.mapObject(function(pairArray, key) {
					return _.map(pairArray, function(onePair) {
						return onePair[1];
					});
				})
				.value();
		}
		return result;
	};

	return fnct;
});
