/*jslint browser: true */

define([
	'views/BaseView',
	'views/AlertView',
	'hbs!hb_templates/search',
	'backgrid',
	'backgrid-select-all',
	'backgrid-paginator'
], function (BaseView, AlertView, hbTemplate, Backgrid, SelectAll, Paginator) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .search-btn' : 'filterPubs',
			'submit .pub-search-form' : 'filterPubs'
		},

		template: hbTemplate,

		render : function() {
			var self = this;
			var $pubList;

			BaseView.prototype.render.apply(this, arguments);
			$pubList = this.$('.pub-grid');

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));

			// Render the grid and attach the root to HTML document
			$pubList.append(this.grid.render().el);

			// Render the paginator
			$pubList.after(this.paginator.render().el);

			this.fetchPromise.fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
			}).always(function() {
				// Make sure indicator is hidden. Need to do this in case the sync signal was sent before the view was rendered
				self.hideLoadingIndicator();
			});
		},

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 *     @prop {PublicationCollection} collection
		 */
		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.futureFeatures = false;

			// Set up collection event handlers and then fetch the collection
			this.listenTo(this.collection, 'backgrid:selected', this.editPublication);
			this.listenTo(this.collection, 'request', this.showLoadingIndicator);
			this.listenTo(this.collection, 'sync', this.hideLoadingIndicator);

			this.fetchPromise = this.collection.fetch({reset: true});

			// Create backgrid and paginator views
			var columns = [
				{
					name: "", // name is a required parameter, but you don't really want one on a select all column
					cell: "select-row"
				}, {
					name: "publicationType",
					label: "Type",
					editable: false,
					cell: "string",
					formatter: _.extend({}, Backgrid.StringFormatter.prototype, {
						fromRaw: function (rawValue, model) {
							return rawValue ? rawValue.text: '';
						}
					})
				}, {
					name: "seriesTitle",
					label: "USGS Series",
					editable: false,
					cell: "string",
					formatter: _.extend({}, Backgrid.StringFormatter.prototype, {
						fromRaw: function (rawValue, model) {
							return rawValue ? rawValue.text: '';
						}
					})
				}, {
					name: "seriesNumber",
					label: "Report Number",
					editable: false,
					cell: "string"
				}, {
					name: "publicationYear",
					label: "Year",
					editable: false,
					cell: "string"
				}, {
					name: "title",
					label: "  Title",
					editable: false,
					cell: "string"
				}
			];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				columns: columns,
				collection: this.collection,
				className : 'backgrid table-striped table-hover table-bordered'
			});

			// Initialize the paginator
			this.paginator = new Backgrid.Extension.Paginator({
				collection: this.collection
			});

			// Create other child views
			this.alertView = new AlertView({
				el: '.alert-container'
			});
		},

		remove : function() {
			this.grid.remove();
			this.paginator.remove();
			this.alertView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 * DOM event handlers
		 */
		editPublication : function(ev) {
			this.router.navigate('publication/' + ev.id, {trigger: true});
		},

		filterPubs : function(ev) {
			var self = this;

			ev.preventDefault();
			this.collection.updateFilters({
				q : this.$('#search-term-input').val()
			});
			this.collection.getFirstPage()
					.fail(function(jqXhr) {
						self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
					});
		},

		/* collection event handlers */
		showLoadingIndicator : function() {
			console.log('Show loading indicator');
			this.$('.pubs-loading-indicator').show();
		},

		hideLoadingIndicator : function() {
			console.log('Hide loading indicator');
			this.$('.pubs-loading-indicator').hide();
		}
	});

	return view;
});