/* jslint browser: true */

define([
	'underscore',
	'backbone',
	'views/BaseView',
	'views/SearchFilterRowView',
	'hbs!hb_templates/searchFilter'
], function(_, Backbone, BaseView, SearchFilterRowView, hb_template) {
	"use strict";

	var view = BaseView.extend({

		template : hb_template,

		events : {
			'change #search-term-input' : 'updateQterm',
			'click .add-category-btn' : 'addFilterRow',
			'click .clear-advanced-search-btn' : 'clearFilterRows'
		},

		/*
		 * @constructs
		 * @param {Object}
		 *     @prop {String} el - Jquery selector where view will be rendered
		 * @return {View} - as part of initialization, a model is created which will contain the current
		 *     filter key-value pairs. The attributes of this model can be used to call
		 *     PublicationCollection.updateFilters
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.model = new Backbone.Model();

			this.listenTo(this.model, 'change:q', this.changeQTerm);
			this.filterRowViews = [];
		},

		remove : function() {
			_.each(this.filterRowViews, function(view) {
				view.remove();
			});
			BaseView.prototype.remove.apply(this, arguments);
		},

		/*
		 * DOM event handlers
		 */

		updateQterm : function(ev) {
			this.model.set('q', ev.currentTarget.value);
		},

		addFilterRow : function(ev) {
			ev.preventDefault();
			var $rowContainer = this.$('.advanced-search-rows-container');
			var newRow = new SearchFilterRowView({
				el : '.filter-row-container',
				model : this.model
			});
			$rowContainer.append('<div class="filter-row-container"></div>');
			this.$('.advanced-search-rows-container').append('<div ');
			newRow.setElement($rowContainer.find('.filter-row-container:last-child')).render();
			this.filterRowViews.push(newRow);
		},

		clearFilterRows : function(ev) {
			var self = this;
			ev.preventDefault();
			_.each(this.filterRowViews, function(view) {
				view.remove();
			});
			this.filterRowViews = [];
		},

		/*
		 * Model event handlers
		 */
		changeQTerm : function() {
			this.$('#search-term-input').val(this.model.get('q'));
		}

	});

	return view;
});