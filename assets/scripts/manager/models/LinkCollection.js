/* jslint browser: true */

define([
	'models/LinkModel',
	'models/OrderedCollection'
], function(LinkModel, OrderedCollection) {
	'use strict';

	var collection = OrderedCollection.extend({
		model : LinkModel
	});

	return collection;
});
