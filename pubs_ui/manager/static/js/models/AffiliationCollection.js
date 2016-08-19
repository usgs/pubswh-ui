/* jslint browser:true */

define([
	'backbone',
	'models/AffiliationModel',
	'models/LookupModel',
	'module'
], function(Backbone, AffiliationModel, LookupModel, module) {
	"use strict";

	var collection = Backbone.Collection.extend({
		model : LookupModel,
		url : null,
		_setUrl : function(isCostCenter) {
			var targetUrl;
			var lookupUrl = module.config().lookupUrl;
			if (isCostCenter) {
				targetUrl = lookupUrl + 'costcenters';
			}
			else {
				targetUrl = lookupUrl + 'outsideaffiliates';
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