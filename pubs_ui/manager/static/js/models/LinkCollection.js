/* jslint browser: true */

define([
	'backbone',
	'models/LinkModel'
], function(Backbone, LinkModel) {
	"use strict";

	var collection = Backbone.Collection.extend({
		model : LinkModel,

		comparator : 'rank',

		updateModelRank : function(model, newRank) {
			var i;
			var oldRank = model.get('rank');
			if (oldRank > newRank) {
				for (i = newRank; i < oldRank; i++) {
					this.at(i - 1).set('rank', i + 1);
				}
			}
			else {
				for (i = oldRank; i < newRank; i++) {
					this.at(i - 1).set('rank', i - 1);
				}
			}
			model.set('rank', newRank);
			this.sort();
		}
	});

	return collection;
});
