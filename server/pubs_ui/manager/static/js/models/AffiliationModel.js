/* jslint browser: true */

define([
	'backbone',
	'underscore',
	'module'
], function(Backbone, _, module) {
	"use strict";

	var model = Backbone.Model.extend({

		/*
		 * @param {Boolean} isCostCenter - boolean indicating whether affiliation belongs to a cost center
		 */

		urlRoot : null,

		defaults : {
			'active' : false
		},

		_constructUrl : function(isCostCenter) {
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

		fetch : function(options, isCostCenter) {
			var fetchedModel;
			this.urlRoot = this._constructUrl(isCostCenter);
			fetchedModel = Backbone.Model.prototype.fetch.call(this, options);
			return fetchedModel;
		},

		destroy : function(options, isCostCenter) {
			this.urlRoot = this._constructUrl(isCostCenter);
			return Backbone.Model.prototype.destroy.call(this, options);
		},

		save : function(attributes, options, isCostCenter) {
			this.urlRoot = this._constructUrl(isCostCenter);
			return Backbone.Model.prototype.save.apply(this, attributes, options);
		}
	});
	return model;
});