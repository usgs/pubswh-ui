/* jslint browser: true */

define([
	'backbone',
	'module'
], function(Backbone, module) {
		var collection = Backbone.Collection.extend({
		url : module.config().scriptRoot + '/manager/services/lists',

		comparator : 'text'
	});

	return collection;
});
