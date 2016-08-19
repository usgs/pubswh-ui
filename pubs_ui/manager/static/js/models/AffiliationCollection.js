/* jslint browser:true */

define([
	'backbone',
	'models/AffiliationModel',
	'module'
], function(Backbone, AffiliationModel, module) {
	"use strict";

	var collection = Backbone.Collection.extend({
		model : AffiliationModel,
		url : null,
		_setUrl : function(isCostCenter) {
			var targetUrl;
			var scriptRoot = module.config().scriptRoot;
			if (isCostCenter) {
				targetUrl = scriptRoot + '/manager/services/costcenter';
			}
			else {
				targetUrl = scriptRoot + '/manager/services/outsideaffiliation';
			}
			this.url = targetUrl;
			return targetUrl;
		},

		fetch : function(options, isCostCenter) {
			var fetchedModels;
			this.url = this._setUrl(isCostCenter);
			fetchedModels = Backbone.Collection.prototype.fetch.call(this, options);
			return fetchedModels;
		}
	});
	return collection;
});