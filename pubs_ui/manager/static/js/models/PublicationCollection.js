/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'module',
	'models/PublicationModel'
], function($, Backbone, module, PublicationModel) {
	"use strict";

	var collection = Backbone.Collection.extend({
//		model : PublicationModel,
		url : module.config().scriptRoot + '/manager/services/mppublications?contributor=&indexID=&ipdsId=&mimetype=json&page_row_start=0&page_size=100&prodID=&q=&seriesName=&subtypeName=&title=&typeName=&year=',
		parse : function (response) {
			return response.records;
		}
	});

	return collection;
});