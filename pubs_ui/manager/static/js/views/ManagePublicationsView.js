/*jslint browser: true */

define([
	'module',
	'backbone',
	'backgrid',
	'backgrid-paginator',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'views/BaseView',
	'views/AlertView',
	'views/SearchFilterRowView',
	'hbs!hb_templates/managePublications'
], function (module, Backbone, Backgrid, Paginator, BackgridUrlCell, BackgridClientSortingBody, BaseView,
			 AlertView, SearchFilterRowView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'change .page-size-select' : 'changePageSize',
			'click .search-btn' : 'filterPubs',
			'submit .pub-search-form' : 'filterPubs',
			'change #search-term-input' : 'updateQterm',
			'click .add-category-btn' : 'addFilterRow',
			'click .clear-advanced-search-btn' : 'clearFilterRows',
			'click .create-pub-btn' : 'goToEditPubPage'
		},

		template: hbTemplate,

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 *     @prop {PublicationCollection} collection
		 */
		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			// Create filter model, listeners, and holder for filter rows.
			this.filterModel = new Backbone.Model();
			this.listenTo(this.model, 'change:q', this.changeQterm);
			this.filterRowViews = [];

			// Can get rid of this once the edit contributors page is implemented.
			this.context.oldMyPubsEndpoint = module.config().oldMyPubsEndpoint;

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

		remove : function() {
			this.grid.remove();
			this.paginator.remove();
			this.alertView.remove();
			_.each(this.filterRowViews, function(view) {
				view.remove();
			});

			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 * DOM event handlers
		 */
		filterPubs : function(ev) {
			var self = this;

			ev.preventDefault();
			this.collection.updateFilters(this.filterModel.attributes);
			this.collection.getFirstPage()
					.fail(function(jqXhr) {
						self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
					});
		},

		changePageSize : function(ev) {
			this.collection.setPageSize(parseInt(ev.currentTarget.value));
		},

		updateQterm : function(ev) {
			this.filterModel.set('q', ev.currentTarget.value);
		},

		addFilterRow : function(ev) {
			ev.preventDefault();
			var $rowContainer = this.$('.advanced-search-rows-container');
			var newRow = new SearchFilterRowView({
				el : '.filter-row-container',
				model : this.filterModel
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

		goToEditPubPage : function (ev) {
			this.router.navigate('publication', {trigger: true});
		},

		/*
		 * filterModel event handlers
		 */
		changeQTerm : function() {
			this.$('#search-term-input').val(this.filterModel.get('q'));
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