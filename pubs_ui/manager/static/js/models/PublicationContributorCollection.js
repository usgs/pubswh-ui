/* jslint browser: true */

define([
	'models/PublicationContributorModel',
	'models/OrderedCollection'
], function(PublicationContributorModel, OrderedCollection) {
	"use strict";

	var collection = OrderedCollection.extend({
		model : PublicationContributorModel
	});

	return collection;
});
