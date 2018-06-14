/* jslint browser:true */
/* global define */

define([
	'backbone',
	'models/LookupModel',
	'module'
], function(Backbone, LookupModel, module) {
	'use strict';

	var collection = Backbone.Collection.extend({
		model: LookupModel,
		url: module.config().lookupUrl + 'outsideaffiliates?mimetype=json'
	});

	return collection;

});