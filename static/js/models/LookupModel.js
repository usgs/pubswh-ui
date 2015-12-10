/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		defaults: {
			'id': '',
			'text': ''
		}
	});

	return model;
});