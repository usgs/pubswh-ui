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
		model : PublicationModel,

		url : module.config().scriptRoot + '/manager/services/mppublications',

		// Initial pagination states
		state: {
			firstPage: 0,
			currentPage: 0,
			pageSize: 100
		},

		// maps the query parameters accepted by service to `state` keys
		// to those your server supports
		queryParams: {
			currentPage: "page_row_start",
			pageSize: "page_size",
			totalRecords: "record_count"
		},

		// get the state from web service result
		parseState: function (resp, queryParams, state, options) {
			return {totalRecords: resp.recordCount};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			return _.map(resp.records, function(element) {
				var pubModel = new PublicationModel();
				return pubModel.parse(element);
			});
		}

	});

	return collection;
});