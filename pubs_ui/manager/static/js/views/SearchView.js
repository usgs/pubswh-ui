/*jslint browser: true */

define([
	'backgrid',
	'backgrid-select-all',
	'backgrid-paginator',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'views/BaseView',
	'views/AlertView',
	'hbs!hb_templates/search'
], function (Backgrid, SelectAll, Paginator, BackgridUrlCell, BackgridClientSortingBody, BaseView, AlertView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .search-btn' : 'filterPubs',
			'submit .pub-search-form' : 'filterPubs',
			'change .page-size-select' : 'changePageSize'
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
			this.$('.pub-grid-footer').append(this.paginator.render().el);

			this.fetchPromise.fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
			}).always(function() {
				// Make sure indicator is hidden. Need to do this in case the sync signal was sent before the view was rendered
				self.updatePubsListDisplay();
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
			this.listenTo(this.collection, 'request', this.showLoadingIndicator);
			this.listenTo(this.collection, 'sync', this.updatePubsListDisplay);

			this.fetchPromise = this.collection.fetch({reset: true});

			var fromRawLookup = function(rawValue, model) {
				return (rawValue) ? rawValue.text : '';
			};
			var sortValueLookup = function(model, colName) {
				return fromRawLookup(model.get(colName), model);
			};
			var sortValueText = function(model, colName) {
				return (model.has(colName)) ? model.get(colName) : '';
			};

			var fromRawFirstAuthor = function(rawValue, model) {
				if ((rawValue) && _.has(rawValue, 'authors') && (_.isArray(rawValue.authors)) && (rawValue.authors.length > 0)) {
					return rawValue.authors[0].text;
				}
				else {
					return '';
				}
			};
			var sortValueFirstAuthor = function(model, colName) {
				return fromRawFirstAuthor(model.get(colName));
			};

			// Create backgrid and paginator views
			var columns = [
				{
					name: 'id',
					label : '',
					editable : false,
					sortable : false,
					cell: BackgridUrlCell.extend({
						router : this.router,
						toFragment : function(rawValue, model) {
							return 'publication/' + rawValue;
						},
						title : 'Click to edit'
					}),
					formatter : {
						fromRaw : function(rawValue, model) {
							return 'Edit'
						}
					}
				}, {
					name: "publicationType",
					label: "Type",
					editable: false,
					sortable : true,
					cell: "string",
					formatter : {
						fromRaw : fromRawLookup
					},

					sortValue : sortValueLookup
				}, {
					name: "seriesTitle",
					label: "USGS Series",
					editable: false,
					sortable : true,
					cell: "string",
					formatter: {
						fromRaw: fromRawLookup
					},
					sortValue : sortValueLookup
				}, {
					name: "seriesNumber",
					label: "Report Number",
					editable: false,
					sortable : true,
					cell: "string",
					sortValue : sortValueText
				}, {
					name: "publicationYear",
					label: "Year",
					editable: false,
					sortable : true,
					cell: "string",
					sortValue : sortValueText
				},{
					name: 'indexId',
					label : 'Index ID',
					editable : false,
					sortable : true,
					cell: 'string',
					sortValue : sortValueText
				}, {
					name: "title",
					label: "Title",
					editable: false,
					sortable : true,
					cell: "string",
					sortValue : sortValueText
				},{
					name: 'contributors',
					label: 'First Author',
					editable : false,
					sortable : true,
					cell: 'string',
					formatter : {
						fromRaw : fromRawFirstAuthor
					},
					sortValue : sortValueFirstAuthor
				}
			];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				body : BackgridClientSortingBody,
				columns: columns,
				collection: this.collection,
				className : 'backgrid table-striped table-hover table-bordered'
			});

			// Initialize the paginator
			this.paginator = new Backgrid.Extension.Paginator({
				collection: this.collection,
				goBackFirstOnSort : false
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

		changePageSize : function(ev) {
			this.collection.setPageSize(parseInt(ev.currentTarget.value));
		},

		/* collection event handlers */
		showLoadingIndicator : function() {
			this.$('.pubs-loading-indicator').show();
		},

		updatePubsListDisplay : function() {
			this.$('.pubs-loading-indicator').hide();
			this.$('.pubs-count').html(this.collection.state.totalRecords);
		}
	});

	return view;
});