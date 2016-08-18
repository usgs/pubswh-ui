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

		parse : function(response, options) {
			console.log('Using AffiliationModel parse method');
		},

		fetch : function(options) {
			var fetchedModel;
			var params = {
				data : {
					mimetype : 'json'
				}
			};
			if (_.isObject(options)) {
				_.extend(params, options);
			}
			try {
				this.urlRoot = this._constructUrl(false);
				fetchedModel = Backbone.Model.prototype.fetch.call(this, params);
			}
			catch(err) {
				console.log('Handling the Error');
				this.urlRoot = this._constructUrl(true);
				fetchedModel = Backbone.Model.prototype.fetch.call(this, params);
			}
			console.log('Using AffiliationModel fetch method');
			return fetchedModel;
		},

		save : function(attributes, options, isCostCenter) {
			this.urlRoot = this._constructUrl(isCostCenter);
			return Backbone.Model.prototype.save.apply(this, attributes, options);
		}
	});
	return model;
});