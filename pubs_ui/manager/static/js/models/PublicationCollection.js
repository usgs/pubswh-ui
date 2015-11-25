/* jslint browser: true */

define([
	'jquery',
	'backbone',
	'backbone.paginator',
	'module',
	'models/PublicationModel'
], function($, Backbone, Pageable, module, PublicationModel) {
	"use strict";

	var collection = Backbone.PageableCollection.extend({
//		model : PublicationModel,  need to figure out how to handle default links collection for this to work

		url : module.config().scriptRoot + '/manager/services/mppublications',

		state: {
			pageSize: 100
		},

		mode: "client",

		parse : function (response) {
			return response.records;
		},

		fetch : function(options) {
			var params = {
				data : {
					mimetype : 'json',
					page_row_start: 0,
					page_size: 100
				}
			};
			if (_.isObject(options)) {
				_.extend(params, options);
			}
			return Backbone.Collection.prototype.fetch.call(this, params);
		}
	});

	return collection;
});