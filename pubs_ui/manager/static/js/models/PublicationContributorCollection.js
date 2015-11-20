/* jslint browser: true */

define([
	'backbone',
	'models/ContributorModel'
], function(Backbone, ContributorModel) {
	"use strict";

	var model = Backbone.Model.extend({

		comparator : 'rank',

		defaults : function() {
			return {
				rank : '',
				contributor : new ContributorModel()
			}
		}
	});

	var collection = Backbone.Collection.extend({
		model : model
	});

	return collection;
});
