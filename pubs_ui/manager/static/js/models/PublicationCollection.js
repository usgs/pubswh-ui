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

		url : function() {
			return module.config().scriptRoot + '/manager/services/mppublications?mimetype=json' +
					((_.isEmpty(this.filters)) ? '' : '&' + $.param(this.filters))
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

		// get the state from web service result
		parseState: function (resp, queryParams, state, options) {
			return {totalRecords: resp.recordCount};
		},

		// get the actual records
		parseRecords: function (resp, options) {
			return _.map(resp.records, function(element) {
				var pubModel = new PublicationModel();
				var response = pubModel.parse(element);
				// Change the attributes that are collections or models into arrays of objects. The native parse for Backbone.collection
				// does not handle attributes that are collections or models well and you end up with these attributes to not contain
				// what is expected.
				var contributorsResp = {};

				response.links = response.links.toJSON();

				_.each(response.contributors.attributes, function(collection, contribType) {
					contributorsResp[contribType] = collection.toJSON();
				});
				response.contributors = contributorsResp;
				return response;
			});
		}

	});

	return collection;
});