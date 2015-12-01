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
				'click .search-btn' : 'filterPubs'
		},

		template: hbTemplate,

		render : function() {
			var self = this;
			var $pubList;
			var $loadingIndicator;

			BaseView.prototype.render.apply(this, arguments);
			$pubList = this.$('.pub-grid');
			$loadingIndicator = this.$('.loading-indicator');

			$loadingIndicator.show();

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));

			// Render the grid and attach the root to HTML document
			$pubList.append(this.grid.render().el);

			// Render the paginator
			$pubList.after(this.paginator.render().el);

			this.fetchPromise.fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
			}).always(function() {
				$loadingIndicator.hide();
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

			//build grid
			var columns = [{
				// name is a required parameter, but you don't really want one on a select all column
				name: "",
				// Backgrid.Extension.SelectRowCell lets you select individual rows
				cell: "select-row"
			//}, {
			//	name: "id",
			//	label: "Link",
			//	editable: false,
			//	cell: "uri",
			//	formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
			//		fromRaw: function (rawValue, model) {
			//			return rawValue ? '<a href="#/publication/' + rawValue + '">test</a>' : '';
			//		}
			//	})
			}, {
				name: "publicationType",
				label: "Type", // The name to display in the header
				editable: false, // By default every cell in a column is editable
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
			}];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				columns: columns,
				collection: this.publicationList,
				class : 'backgrid table-striped'
			});

			// Initialize the paginator
			this.paginator = new Backgrid.Extension.Paginator({
				collection: this.publicationList
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

		/*
		 * DOM event handlers
		 */
		filterPubs : function() {
			var self = this;
			var q = this.$('#search-term-input').val();

			this.$('.loading-indicator').show();
			this.publicationList.updateFilters({
				q : this.$('#search-term-input').val()
			});
			this.publicationList.getFirstPage()
					.fail(function(jqXhr) {
						self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
					}).always(function() {
						self.$('.loading-indicator').hide();
					});
		}

	});

	return view;
});