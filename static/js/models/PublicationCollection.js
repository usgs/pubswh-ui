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
			return module.config().scriptRoot + '/manager/services/mppublications'
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

		fetch : function(options) {
			var defaultData = _.extend({mimetype: 'json'}, this.filters);
			if (_.has(options, 'data')) {
				defaultData = _.extend(defaultData, options.data);
			}

			var defaultOptions = _.extend({data : defaultData}, options);

			return Backbone.PageableCollection.prototype.fetch.call(this, _.extend({traditional : true}, defaultOptions))
		},

		updateFilters : function(filters) {
			// Remove values that are null or undefined.
			this.filters = _.pick(filters, function(value) {
				return (value);
			});
		},

		// get the state from web service result
		parseState: function (resp, queryParams, state, options) {
			return {totalRecords: resp.recordCount};
		},

		// get the actual records. We are not using PublicationModel.parse because that returns some properties as models
		// or collections. The Backbone code does not seem to handle this well as the collections and models get garbled.
		// This collection will contain properties which are JSON objects.
		parseRecords: function (resp, options) {
			return resp.records;
		}

	});

	return collection;
});