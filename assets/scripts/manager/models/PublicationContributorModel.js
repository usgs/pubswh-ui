/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	'use strict';

	var model = Backbone.Model.extend({

		comparator : 'rank',

		url : function() {
			return module.config().scriptRoot + '/manager/services/contributor/' + this.get('contributorId');
		},

		defaults : function() {
			return {
				rank : ''
			};
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

		parse : function(response) {
			var affiliation = new Object();
			if (!_.has(response, 'affiliation')) {
				response.affiliation = affiliation;
			}
			return response;
		}
	});

	return model;
});
