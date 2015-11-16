/* jslint browser: true */

define([
	'jquery-ui',
	'models/LinkModel',
	'models/LinkTypeCollection',
	'models/LinkFileTypeCollection',
	'views/BaseView',
	'views/LinkRowView',
	'hbs!hb_templates/links'
], function(jqueryUI, LinkModel, LinkTypeCollection, LinkFileTypeCollection, BaseView, LinkRowView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click button' : 'addNewLink'
		},

		template : hbTemplate,


		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			//Initialize the collections needed to implement the link type and link file type selection menus
			this.linkTypeCollection = new LinkTypeCollection();
			this.linkFileTypeCollection = new LinkFileTypeCollection();

			this.lookupFetchPromise = $.when(this.linkTypeCollection.fetch(), this.linkFileTypeCollection.fetch());
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
				self.linkRowViews = _.chain(self.linkRowViews)
						.sortBy(function(view) {
							return view.model.get('rank');
						})
						.each(function(view) {
							self.renderViewRow(view)
						})
						.value();
			});

			return this;
		},

		renderViewRow : function(rowView) {
			var $rowDiv;
			this.$('.grid').append('<div class="link-row-div"></div>');
			rowView.setElement(this.$('.grid .link-row-div:last-child')).render();
		},

		addLinkRow : function(model) {
			var view = new LinkRowView({
				model : model,
				collection : this.collection,
				el : '.grid',
				linkTypeCollection : this.linkTypeCollection,
				linkFileTypeCollection : this.linkFileTypeCollection
			});
			this.linkRowViews.push(view);

			if (this.lookupFetchPromise.state() === 'resolved' && (this.$('.grid').length > 0)) {
				this.renderViewRow(view);
			}
		},

		removeLinkRow : function(model) {
			var viewToRemove = _.findWhere(this.linkRowViews, {model : model});
			viewToRemove.remove();
		},

		addNewLink : function() {
			var newModel = new LinkModel({
				rank : this.collection.length + 1
			});
			this.collection.add([newModel]);
		}
	});

	return view;
})
