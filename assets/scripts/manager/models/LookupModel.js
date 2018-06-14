/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
		var model = Backbone.Model.extend({
		defaults: {
			'id': '',
			'text': ''
		}
	});

	return model;
});
