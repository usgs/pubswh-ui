/* jslint browser: true */

define([
		'underscore',
	'handlebars',
	'views/BaseView',
	'views/ContributorRowView',
	'hbs!hb_templates/contributorTab'
], function(_, Handlebars, BaseView, ContributorRowView, hb_template) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .add-btn' : 'addNewRow'
		},

		template : hb_template,

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {Backbone.collection} collection
		 *     @prop {Object} contributorType
		 *     @prop {String} el - jquery selector where the view will be rendered.
		 */
		initialize : function(options) {

			BaseView.prototype.initialize.apply(this, arguments);
			this.contributorType = options.contributorType;
			this.renderDeferred = $.Deferred();

			this.rows = this.collection.map(function(model, index) {
				var rowClass = 'contributor-row-' + index
				return {
					class : rowClass,
					view : new ContributorRowView({
						el : '.' + rowClass,
						model : model
					})
				};
			});

			this.listenTo(this.collection, 'add', this.addRow);
			this.listenTo(this.collection, 'remove', this.removeRow);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			_.each(this.rows, function(row) {
				self.$('.grid').append('<div class="' + row.class + '"></div>');
				row.view.setElement(row.el).render();
			});
			this.renderDeferred.resolve();
		},

		addNewRow : function() {
			var newModel = new this.collection.model({
				contributorType : this.contributorType,
				rank : this.rows.length + 1
			});

			this.collection.add(newModel);
		},

		/*
		 * collection event handlers
		 */
		addRow : function(model) {
			var self = this;

			var newClass = 'contributor-row' + this.rows.length;
			var newRow = {
				el: '.' + newClass,
				view: new ContributorRowView({
					model: model,
					el: '.' + newClass,
					linkTypeCollection: this.linkTypeCollection,
					linkFileTypeCollection: this.linkFileTypeCollection
				})
			};

			this.rows.push(newRow);

			this.renderDeferred.done(function() {
				self.$('.grid').append('<div class="' + newClass + '"></div>');
				newRow.view.setElement(newRow.el).render();
			});
		},

		removeRow : function(model) {
			var rowToRemove = _.findWhere(this.rows, function(row) {
				return row.view.model = model;
			});

			if (rowToRemove) {
				rowToRemove.view.remove();
				this.rows = _.reject(this.rows, function(row) {
					return row === rowToRemove;
				});
			}
		},

		remove : function() {
			_.each(this.rows, function(row) {
				row.view.remove();
			});

			BaseView.prototype.remove.apply(this, arguments);
			return this;
		}
	});

	return view;
});
