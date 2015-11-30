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
			pageSize: 15
		},

		// You can remap the query parameters from `state` keys from
		// the default to those your server supports
		queryParams: {
			totalRecords: recordCount,
		},

		// get the state from Github's search API result
		parseState: function (resp, queryParams, state, options) {
		  return {totalRecords: resp.recordCount};
		},

		// get the actual records
		parseRecords: function (resp, options) {
		//  return resp.records;
			_.each(resp.records, function(element) {
				if (element.links) {
					delete element.links; //work around until I figure out how to handle the LinkCollection on the model
				}
			});
			return resp.records;
		}

		//mode: "client",

		//parse : function (resp) {
		//	_.each(resp.records, function(element) {
		//		if (element.links) {
		//			delete element.links;
		//		}
		//	});
		//	return resp.records;
		//},

		//fetch : function(options) {
		//	var params = {
		//		data : {
		//			mimetype : 'json',
		//			page_row_start: 0,
		//			page_size: 100
		//		}
		//	};
		//	if (_.isObject(options)) {
		//		_.extend(params, options);
		//	}
		//	return Backbone.Collection.prototype.fetch.call(this, params);
		//}
	});

	return collection;
});