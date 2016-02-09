/*jslint browser: true */

define([
	'module',
	'backbone',
	'underscore',
	'jquery',
	'backgrid',
	'backgrid-paginator',
	'models/PublicationListCollection',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'views/BaseView',
	'views/AlertView',
	'views/WarningDialogView',
	'views/SearchFilterRowView',
	'hbs!hb_templates/managePublications'
], function (module, Backbone, _, $, Backgrid, Paginator, PublicationListCollection,
			 BackgridUrlCell, BackgridClientSortingBody, BaseView,
			 AlertView, WarningDialogView, SearchFilterRowView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		allowClear : true,
		theme : 'bootstrap'
	};

	var view = BaseView.extend({

		events : {
			'change .page-size-select' : 'changePageSize',
			'click .search-btn' : 'filterPubs',
			'submit .pub-search-form' : 'filterPubs',
			'change #search-term-input' : 'updateQterm',
			'click .add-category-btn' : 'addFilterRow',
			'click .clear-advanced-search-btn' : 'clearFilterRows',
			'click .create-pub-btn' : 'goToEditPubPage',
			'click .add-to-lists-btn' : 'addSelectedPubsToCategory'
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

			//Fetch publication lists
			this.publicationListCollection = new PublicationListCollection();
			this.pubListFetch = this.publicationListCollection.fetch();

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
					name: 'selected',
					label : '',
					editable : true,
					sortable : false,
					cell : Backgrid.BooleanCell.extend({
						events : {
							'change input': function (e) {
								this.model.set(this.column.get('name'), e.target.checked);
							}
						}
					})
				},
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
							return 'Edit';
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
					label: "Series Name",
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
					name: 'chapter',
					label : 'Chapter',
					editable : false,
					sortable: true,
					cell: 'string',
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
				},{
					name: 'sourceDatabase',
					label: 'Origin',
					editable : false,
					sortable: true,
					cell: 'string',
					sortValue : sortValueText
				},
				{
					name : 'published',
					label : 'Published',
					editable : false,
					sortable : true,
					cell : 'string',
					formatter : {
						fromRaw : function(rawValue, model) {
							return (rawValue) ? 'Yes' : 'No'
						}
					}
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

			this.warningDialogView = new WarningDialogView({
				el : '.warning-dialog-container'
			});
		},

		render : function() {
			var self = this;
			var $pubList;

			BaseView.prototype.render.apply(this, arguments);
			$pubList = this.$('.pub-grid');

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));
			this.warningDialogView.setElement(this.$('.warning-dialog-container')).render();

			// Render the grid and attach the root to HTML document
			$pubList.append(this.grid.render().el);

			// Render the paginator
			this.$('.pub-grid-footer').append(this.paginator.render().el);

			// Initialize the publication lists select2
			this.pubListFetch.then(function() {
				self.$('#pubs-categories-select').select2(_.extend({
					data : self.publicationListCollection.toJSON()
				}, DEFAULT_SELECT2_OPTIONS));
			});

			this.fetchPromise.fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
			}).always(function() {
				// Make sure indicator is hidden. Need to do this in case the sync signal was sent before the view was rendered
				self.updatePubsListDisplay();
			});

			return this;
		},

		remove : function() {
			this.grid.remove();
			this.paginator.remove();
			this.alertView.remove();
			this.warningDialogView.remove();
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
			ev.preventDefault();
			this.router.navigate('publication', {trigger: true});
		},

		addSelectedPubsToCategory : function(ev) {
			var self = this;

			var selectedPubs = this.collection.filter(function(model) {
				return (model.has('selected') && model.get('selected'));
			});
			var pubsIdData = $.param({
				publicationId : _.map(selectedPubs, function(model) {
					return model.get('id');
				})
			}, true);
			var pubsList = this.$('#pubs-categories-select').val();
			var addDeferreds = [];
			var serviceUrl = module.config().scriptRoot + '/manager/services/lists/';

			ev.preventDefault();

			if (!selectedPubs || selectedPubs.length === 0) {
				this.warningDialogView.show(
					'Select Publications',
					'You must select at least one publication to add to the list(s)'
				);
			}
			else if (!pubsList || pubsList.length === 0) {
				this.warningDialogView.show(
					'Select Lists',
					'You must select at least one publication list'
				);
			}
			else {
				addDeferreds = _.map(pubsList, function (pubListId) {
					return $.ajax({
						url: serviceUrl + pubListId + '/pubs?' + pubsIdData,
						method: 'POST'
					});
				});
				$.when.apply(this, addDeferreds)
					.done(function() {
						self.alertView.showSuccessAlert('Selected publications successfully added to the chosen lists');
					})
					.fail(function() {
						self.alertView.showDangerAlert('Error: Unable to add selected publications to the chosen lists');
					});
			}
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