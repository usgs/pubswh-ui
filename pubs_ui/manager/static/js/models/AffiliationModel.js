/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	"use strict";

	var model = Backbone.Model.extend({

		/*
		 * @param {Boolean} isCostCenter - boolean indicating whether affiliation belongs to a cost center
		 */
		urlRoot : function(isCostCenter) {
			var targetUrl;
			var scriptRoot = module.config().scriptRoot;
			if (isCostCenter) {
				targetUrl = scriptRoot + '/manager/services/costcenter';
			}
			else {
				targetUrl = scriptRoot + '/manager/services/outsideaffiliation';
			}
			return targetUrl;
		},

		save : function(attributes, options, isCostCenter) {
			this.urlRoot = this.urlRoot(isCostCenter);
			return Backbone.Model.prototype.save.apply(this, attributes, options);
		}
	});
	return model;
});