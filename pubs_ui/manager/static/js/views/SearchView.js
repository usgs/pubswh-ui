/*jslint browser: true */

define([
	'bootstrap',
	'handlebars',
	'views/BaseView',
	'views/AlertView',
	'hbs!hb_templates/search',
	'backgrid',
	'select-all',
	'paginator',
	'backbone.stickit',
	'models/PublicationCollection'
], function (bootstrap, Handlebars, BaseView, AlertView, hbTemplate, Backgrid, SelectAll, Paginator, Stickit, PublicationCollection) {
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
			var $loadingIndicator;

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
			});
		},

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 */
		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.futureFeatures = false;

			this.publicationList = new PublicationCollection();
			this.listenTo(this.publicationList, 'backgrid:selected', this.editPublication);
			this.listenTo(this.publicationList, 'request', this.showLoadingIndicator);
			this.listenTo(this.publicationList, 'sync', this.hideLoadingIndicator);

			//build grid
			var columns = [
				{
					// name is a required parameter, but you don't really want one on a select all column
					name: "",
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
				collection: this.publicationList,
				className : 'backgrid table-striped table-hover table-bordered'
			});

			// Initialize the paginator
			this.paginator = new Backgrid.Extension.Paginator({
				collection: this.publicationList,
			});

			this.fetchPromise = this.publicationList.fetch({reset: true});

			// Create child views
			this.alertView = new AlertView({
				el: '.alert-container'
			});
		},

		remove : function() {
			this.alertView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		editPublication : function(ev) {
			this.router.navigate('publication/' + ev.id, {trigger: true});
		},

		showLoadingIndicator : function() {
			console.log('Show loading indicator');
			this.$('.pubs-loading-indicator').show();
		},

		hideLoadingIndicator : function() {
			console.log('hide loading indicator');
			this.$('.pubs-loading-indicator').hide();
		},

		/*
		 * DOM event handlers
		 */
		filterPubs : function(ev) {
			var self = this;

			ev.preventDefault();
			this.publicationList.updateFilters({
				q : this.$('#search-term-input').val()
			});
			this.publicationList.getFirstPage()
					.fail(function(jqXhr) {
						self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
					});
		}

	});

	return view;
});