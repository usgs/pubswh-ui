/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var model = Backbone.Model.extend({

		defaults : function() {
			return {
				q: ''
			}
		},
		advancedSearchProps : [
			'propId',
			'indexId',
			'ipdsId',
			'contributor',
			'title',
			'typeName',
			'subtypeName',
			'seriesName',
			'year'
		]
	});

	return model;
});