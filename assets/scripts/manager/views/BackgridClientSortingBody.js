/* jslint browser: true */
define([
	'backgrid'
], function(Backgrid) {
	'use strict';
	/*
	 * Extended Backgrid body to redefine the sort function to always use client side sorting.
	 */
	var view = Backgrid.Body.extend({
		/*
		Took the sort function from Backgrid.Body version 0.3.5 and modified to force it to sort the collection on
		the client side rather than using the mode to determine server or client side.
		*/
		sort: function (column, direction) {

			if (!_.contains(['ascending', 'descending', null], direction)) {
				throw new RangeError('direction must be one of "ascending", "descending" or `null`');
			}

			if (_.isString(column)) column = this.columns.findWhere({name: column});

			var collection = this.collection;

			var order;
			if (direction === 'ascending') order = -1;
			else if (direction === 'descending') order = 1;
			else order = null;

			var comparator = this.makeComparator(column.get('name'), order,
					order ?
							column.sortValue() :
							function (model) {
								return model.cid.replace('c', '') * 1;
							});

			collection.setSorting(order && column.get('name'), order,
					{sortValue: column.sortValue()});
			collection.comparator = comparator;
			collection.sort();
			collection.trigger('backgrid:sorted', column, direction, collection);

			column.set('direction', direction);

			return this;
		}
	});

	return view;
});