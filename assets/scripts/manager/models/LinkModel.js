/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		defaults : function() {
			return {rank : ''}
		}
	});

	return model;
})
