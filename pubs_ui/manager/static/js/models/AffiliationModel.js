/* jslint browser: true */

define([
	'backbone'
], function(Backbone, module) {
	"use strict";

	var model = Backbone.Model.extend({
		defaults : function() {
			return {organizationName : ''}
		}
	});
	return model;
});