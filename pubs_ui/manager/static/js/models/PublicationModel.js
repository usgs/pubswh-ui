/*jslint browser: true */

define([
	'underscore',
	'backbone'
], function(_, Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		urlRoot : '/manager/services/mppublications/',

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
		}
	});

	return model;
});
