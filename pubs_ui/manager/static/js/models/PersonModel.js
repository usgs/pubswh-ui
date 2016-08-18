/* jslint browser: true */
/* global define */

define([
	'underscore',
	'backbone',
	'module'
], function(_, Backbone, module) {
	"use strict";
	var model = Backbone.Model.extend({
		urlRoot: function () {
			var type = (this.has('usgs') && this.get('usgs')) ? 'usgscontributor' : 'outsidecontributor';

			return module.config().scriptRoot + '/manager/services/' + type;
		},

		fetch: function (options) {
			var params = {
				data: {
					mimetype: 'json'
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
