/* jslint browser: true */

define([
	'backgrid'
	], function(Backgrid) {
	"use strict";

	var view = Backgrid.Cell.extend({
		className : 'backgrid-url-cell',

		title : '',

		events : {
			'click a' : 'navigate'
		},

		router : function() {
			return;
		},

		initialize : function(options) {
			this.title = options.title || this.title;
			Backgrid.Cell.prototype.initialize.apply(this, arguments);
		},

		render : function() {
			var rawValue = this.model.get(this.column.get('name'));
			var formattedValue = this.formatter.fromRaw(rawValue, this.model);
			this.$el.empty();
			this.$el.append($('<a>', {
				tabIndex : -1,
				href : '#',
				title : this.title
			}).text(formattedValue));
			this.delegateEvents();

			return this;
		},

		navigate : function(ev) {
			ev.preventDefault();
			var rawValue = this.model.get(this.column.get('name'));
			this.router.navigate(this.toFragment(rawValue, this.model), {trigger : true});
		},

		toFragment : function(rawValue, model) {
			return rawValue;
		}
	});

	return view;
});
