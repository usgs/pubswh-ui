/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	"use strict";

	var model = Backbone.Model.extend({

		urlRoot : module.config().scriptRoot + '/manager/services/outsideaffiliation',

		defaults : {
			costCenter : '',
			outsideAffiliation : ''
		},

		save : function(attributes, options) {
			return Backbone.Model.prototype.save.apply(this, arguments);
		}
	});
	return model;
});