/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	"use strict";

	var model = Backbone.Model.extend({
		idAttribute : 'contributorId',

		urlRoot : function() {
			return module.config().scriptRoot + '/manager/services/contributor/';
		},

		fetch : function(options) {
			var params = {
				data : {
					mimetype : 'json'
				}
			};
			if (_.isObject(options)) {
				_.extend(params, options);
			}
			return Backbone.Model.prototype.fetch.call(this, params);
		},


	});

	return model;
})
