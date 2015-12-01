/* jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone',
	'backbone.paginator',
	'module',
	'models/PublicationModel'
], function(_, $, Backbone, Pageable, module, PublicationModel) {
	"use strict";

	var collection = Backbone.PageableCollection.extend({
		model : PublicationModel,

		url : function() {

			return module.config().scriptRoot + '/manager/services/mppublications?mimetype=json' + ((_.isEmpty(this.filters)) ? '' : '&' + $.param(this.filters))
		},
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
			pageSize:  "page_size"
		},

		initialize : function(models, options) {
			this.filters = {};
			Backbone.PageableCollection.prototype.initialize.apply(this, arguments);
		},

		getFilters : function() {
			return this.filters;
		},

		updateFilters : function(filters) {
			this.filters = filters;
		},

		fetch : function(options) {
			return Backbone.PageableCollection.prototype.fetch.apply(this, arguments);
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