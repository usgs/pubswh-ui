/* jslint browser: true */

define([
	'backbone',
	'models/LookupModel',
	'module'
], function(Backbone, LookupModel, module) {
	"use strict";

	var collection = Backbone.Collection.extend({
		model : LookupModel,
		url : module.config().lookupUrl + 'publishingServiceCenters?mimetype=json'
	});

	return collection;
})