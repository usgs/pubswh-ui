/* jslint browser: true */

define([
	'underscore',
	'jquery-ui',
	'models/LinkModel',
	'models/LinkTypeCollection',
	'models/LinkFileTypeCollection',
	'views/BaseView',
	'views/LinkRowView',
	'hbs!hb_templates/links'
], function(_, jqueryUI, LinkModel, LinkTypeCollection, LinkFileTypeCollection, BaseView, LinkRowView, hbTemplate) {
	'use strict';

	var view = BaseView.extend({

		events : {
			'click button' : 'addNewLink'
		},

		template : hbTemplate,

		/*
		 * @param {Object} options
		 *     @prop {LinkCollection} collection
		 *     @prop {String} el - jquery selector where view will be rendered
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			//Initialize the collections needed to implement the link type and link file type selection menus
			this.linkTypeCollection = new LinkTypeCollection();
			this.linkFileTypeCollection = new LinkFileTypeCollection();

			this.lookupFetchPromise = $.when(this.linkTypeCollection.fetch(), this.linkFileTypeCollection.fetch()).promise();
			this.linkRowViews = this.collection.map(function(m) {
				return new LinkRowView({
					model : m,
					collection : self.collection,
					el : '.grid',
					linkTypeCollection : self.linkTypeCollection,
					linkFileTypeCollection : self.linkFileTypeCollection
				});
			});
			this.listenTo(this.collection, 'add', this.addLinkRow);
			this.listenTo(this.collection, 'remove', this.removeLinkRow);
			this.listenTo(this.collection, 'update', this.updateRowOrder);
		},

		remove : function() {
			_.each(this.linkRowViews, function(view){
				view.remove();
			});
			BaseView.prototype.remove.apply(this, arguments);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);
			this.$('.grid').sortable({
				stop : function(event, ui) {
					ui.item.find('.link-row-container').trigger('updateOrder', ui.item.index());
				}
			});
			this.lookupFetchPromise.done(function() {
				// Sort the views before rendering them
				self.linkRowViews = _.chain(self.linkRowViews)
						.sortBy(function(view) {
							return view.model.get('rank');
						})
						.each(function(view) {
							self.renderViewRow(view);
						})
						.value();
			});

			return this;
		},

		/*
		 * Used internally to render the a row by appending to the grid.
		 */
		renderViewRow : function(rowView) {
			var $grid = this.$('.grid');
			var divText = '<div class="link-row-div"></div>';
			$grid.append(divText);
			rowView.setElement($grid.find('.link-row-div:last-child')).render();
		},

		/*
		 * DOM Event handlers
		 */
		addNewLink : function() {
			var newModel = new LinkModel({
				rank : this.collection.length + 1
			});
			this.collection.add([newModel]);
		},

		/*
		 * collection event handlers
		 */
		addLinkRow : function(model) {
			var view = new LinkRowView({
				model : model,
				collection : this.collection,
				el : '.grid',
				linkTypeCollection : this.linkTypeCollection,
				linkFileTypeCollection : this.linkFileTypeCollection
			});

			this.linkRowViews.push(view);

			// Need to make sure the lookup fetches are complete before rendering the row.
			// If it isn't, it will be rendered in the promise handler within the render function.
			if (this.lookupFetchPromise.state() === 'resolved') {
				this.renderViewRow(view);
			}
		},

		removeLinkRow : function(model) {
			var viewToRemove = _.findWhere(this.linkRowViews, {model : model});

			if (viewToRemove) {
				viewToRemove.remove();
				this.linkRowViews = _.reject(this.linkRowViews, function(view) {
					return view === viewToRemove;
				});
			}
		},

		updateRowOrder : function() {
			var $grid = this.$('.grid');

			this.linkRowViews = _.chain(this.linkRowViews)
					// Sort row views and them move them by successively appending them to the grid.
					.sortBy(function(view) {
						return view.model.attributes.rank;
					})
					.each(function(view) {
						view.$el.appendTo($grid);
					})
					.value();
		}
	});

	return view;
});
