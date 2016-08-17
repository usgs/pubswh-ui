/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	"use strict";

	var model = Backbone.Model.extend({

		//urlRoot : module.config().scriptRoot + '/manager/services/outsideaffiliation',
		urlRoot : 'https://cida-eros-pubsdev.er.usgs.gov:8443/pubs-services/outsideaffiliation',
		defaults : {
			id : '',
			costCenter : '',
			active: '',
			affiliationName : ''
		},

		save : function(attributes, options) {
			return Backbone.Model.prototype.save.apply(this, arguments);
		}
	});
	return model;
});