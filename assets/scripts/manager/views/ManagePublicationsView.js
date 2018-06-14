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
    'hbs!hb_templates/managePublications',
    'hbs!hb_templates/publicationListFilter'
], function (module, Backbone, _, $, Backgrid, Paginator, PublicationListCollection,
             BackgridUrlCell, BackgridClientSortingBody, BaseView,
             AlertView, WarningDialogView, SearchFilterRowView, hbTemplate, pubListTemplate) {
    var DEFAULT_SELECT2_OPTIONS = {
        allowClear : true,
        theme : 'bootstrap'
    };

    var getFilters = function(model) {
        return _.mapObject(model.attributes, function(val) {
            var result;
            if (_.isString(val)) {
                result = val;
            } else {
                result = _.map(val.selections, function(selection) {
                    return val.useId ? selection.id : selection.text;
                });
            }

            return result;
        });
    };

    var view = BaseView.extend({

        events : {
            'change .page-size-select' : 'changePageSize',
            'click .clear-search-btn' : 'clearSearch',
            'click .search-btn' : 'filterPubs',
            'submit .pub-search-form' : 'filterPubs',
            'change #search-term-input' : 'changeQterm',
            'click .add-category-btn' : 'addFilterRow',
            'click .clear-advanced-search-btn' : 'clearFilterRows',
            'click .create-pub-btn' : 'goToEditPubPage',
            'click .manager-seriestitle-btn' : 'goToSeriesTitlePage',
            'click .manager-contribs-btn' : 'goToContributorPage',
            'click .add-to-lists-btn' : 'addSelectedPubsToCategory',
            'click .remove-from-list-btn' : 'removeSelectedPubsFromCategory',
            'change .pub-filter-list-div input[type="checkbox"]' : 'changePubsListFilter',
            'click .manager-affiliation-btn' : 'goToAffiliationManagement'
        },

        template: hbTemplate,

        /*
         * @param {Object} options
         *     @prop {String} el - jquery selector where the view should be rendered
         *     @prop {Backbone.Model} model - contains the current search filter parameters
         *     @prop {PublicationCollection} collection
         */
        initialize : function() {
            BaseView.prototype.initialize.apply(this, arguments);

            //Fetch publication lists
            this.publicationListCollection = new PublicationListCollection();
            this.pubListFetch = this.publicationListCollection.fetch();

            // Create filter model, listeners, and holder for filter rows.
            this.listenTo(this.model, 'change:q', this.updateQTerm);
            this.listenTo(this.model, 'change:listId', this.updatePubsListFilter);
            this.listenTo(this.model, 'change:listId', this.updateVisibilityRemoveFromPubListBtn);
            this.filterRowViews = [];

            // Can get rid of this once the edit contributors page is implemented.
            this.context.oldMyPubsEndpoint = module.config().oldMyPubsEndpoint;

            // Set up collection event handlers and then fetch the collection
            this.listenTo(this.collection, 'request', this.showLoadingIndicator);
            this.listenTo(this.collection, 'sync', this.updatePubsListDisplay);

            this.collection.updateFilters(getFilters(this.model));
            this.fetchPromise = this.collection.fetch({reset: true});

            var fromRawLookup = function(rawValue) {
                return rawValue ? rawValue.text : '';
            };
            var sortValueLookup = function(model, colName) {
                return fromRawLookup(model.get(colName), model);
            };
            var sortValueText = function(model, colName) {
                return model.has(colName) ? model.get(colName) : '';
            };

            var fromRawFirstAuthor = function(rawValue) {
                if (rawValue && _.has(rawValue, 'authors') && _.isArray(rawValue.authors) && rawValue.authors.length > 0) {
                    return rawValue.authors[0].text;
                } else {
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
                        toFragment : function(rawValue) {
                            return 'publication/' + rawValue;
                        },
                        title : 'Click to edit'
                    }),
                    formatter : {
                        fromRaw : function() {
                            return 'Edit';
                        }
                    }
                }, {
                    name: 'publicationType',
                    label: 'Type',
                    editable: false,
                    sortable : true,
                    cell: 'string',
                    formatter : {
                        fromRaw : fromRawLookup
                    },

                    sortValue : sortValueLookup
                }, {
                    name: 'seriesTitle',
                    label: 'Series Name',
                    editable: false,
                    sortable : true,
                    cell: 'string',
                    formatter: {
                        fromRaw: fromRawLookup
                    },
                    sortValue : sortValueLookup
                }, {
                    name: 'seriesNumber',
                    label: 'Report Number',
                    editable: false,
                    sortable : true,
                    cell: 'string',
                    sortValue : sortValueText
                }, {
                    name: 'chapter',
                    label : 'Chapter',
                    editable : false,
                    sortable: true,
                    cell: 'string',
                    sortValue : sortValueText
                }, {
                    name: 'publicationYear',
                    label: 'Year',
                    editable: false,
                    sortable : true,
                    cell: 'string',
                    sortValue : sortValueText
                },{
                    name: 'indexId',
                    label : 'Index ID',
                    editable : false,
                    sortable : true,
                    cell: 'string',
                    sortValue : sortValueText
                }, {
                    name: 'title',
                    label: 'Title',
                    editable: false,
                    sortable : true,
                    cell: 'string',
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
                        fromRaw : function(rawValue) {
                            return rawValue ? 'Yes' : 'No';
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

            this.context.qTerm = this.model.has('q') ? this.model.get('q') : '';
            BaseView.prototype.render.apply(this, arguments);

            $pubList = this.$('.pub-grid');

            // Set the elements for child views and render if needed.
            this.alertView.setElement(this.$('.alert-container'));
            this.warningDialogView.setElement(this.$('.warning-dialog-container')).render();

            // Render the grid and attach the root to HTML document
            $pubList.append(this.grid.render().el);

            // Render the paginator
            this.$('.pub-grid-footer').append(this.paginator.render().el);

            //Create any search filter rows
            _.each(_.keys(this.model.omit(['listId', 'q'])), _.bind(this._createFilterRow, this));

            // Initialize the publication lists select2 and filter
            this.pubListFetch.then(function() {
                var listFilter = self.model.has('listId') ? _.pluck(self.model.get('listId').selections, 'id') : [];
                var pubList = _.map(self.publicationListCollection.toJSON(), function(pubList) {
                    var result = _.clone(pubList);
                    if (_.contains(listFilter, JSON.stringify(result.id))) {
                        result.checked = true;
                    }
                    return result;
                });
                self.$('#pubs-categories-select').select2(_.extend({
                    data : pubList
                }, DEFAULT_SELECT2_OPTIONS));
                self.$('.pub-filter-list-div').html(pubListTemplate({pubList : pubList}));
                self.updateVisibilityRemoveFromPubListBtn();
            });

            this.fetchPromise.fail(function(jqXhr) {
                self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
            }).always(function() {
                self.updatePubsListDisplay();
            });

            // check to see if a publication list filter is selected
            this.updateVisibilityRemoveFromPubListBtn();

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

        _createFilterRow : function(initialCategory) {
            var $rowContainer = this.$('.advanced-search-rows-container');
            var newRow = new SearchFilterRowView({
                el: '.filter-row-container',
                model: this.model,
                initialCategory: initialCategory
            });
            $rowContainer.append('<div class="filter-row-container"></div>');
            this.$('.advanced-search-rows-container').append('<div ');
            newRow.setElement($rowContainer.find('.filter-row-container:last-child')).render();
            this.filterRowViews.push(newRow);
        },

        /*
         * DOM event handlers
         */

        clearSearch : function() {
            this.model.clear({silent : true});
            // No events will be fired so update DOM directly.
            this.updateQTerm();
            this.updatePubsListFilter();
            _.each(this.filterRowViews, function(rowView) {
                rowView.remove();
            });

            this.filterPubs();
        },

        filterPubs : function(ev) {
            var self = this;
            if (ev) {
                ev.preventDefault();
            }
            this.collection.updateFilters(getFilters(this.model));
            this.collection.getFirstPage()
                    .fail(function(jqXhr) {
                        self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
                    });
            window.sessionStorage.searchFilters = JSON.stringify(this.model.attributes);
        },

        changePageSize : function(ev) {
            this.collection.setPageSize(parseInt(ev.currentTarget.value));
        },

        changeQterm : function(ev) {
            this.model.set('q', ev.currentTarget.value);
        },

        addFilterRow : function(ev) {
            ev.preventDefault();
            this._createFilterRow();
        },

        clearFilterRows : function(ev) {
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

        goToSeriesTitlePage : function(ev) {
            ev.preventDefault();
            this.router.navigate('seriesTitle', {trigger: true});
        },

        goToContributorPage : function(ev) {
            ev.preventDefault();
            this.router.navigate('contributor', {trigger: true});
        },

        goToAffiliationManagement : function(ev) {
            ev.preventDefault();
            this.router.navigate('affiliation', {trigger: true});
        },

        addSelectedPubsToCategory : function(ev) {
            var self = this;

            var selectedPubs = this.collection.filter(function(model) {
                return model.has('selected') && model.get('selected');
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
            } else if (!pubsList || pubsList.length === 0) {
                this.warningDialogView.show(
                    'Select Lists',
                    'You must select at least one publication list'
                );
            } else {
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

        removeSelectedPubsFromCategory: function() {
            var self = this;
            var selectedFilter = _.first(getFilters(this.model).listId);
            var serviceUrl = module.config().scriptRoot + '/manager/services/lists/' + selectedFilter;
            var selectedPubs = this.collection.filter(function(model) {
                return model.has('selected') && model.get('selected');
            });
            // get publication ids from selectedPubs
            var selectedPubIds = _.pluck(selectedPubs, 'id');
            // execute the delete requests
            var removeDeferreds = [];
            if (selectedPubIds.length === 0) {
                this.warningDialogView.show(
                    'Select Publications',
                    'You must select at least one publication to remove from the current filter list.'
                );
            } else {
                removeDeferreds = _.map(selectedPubIds, function(selectedPubId) {
                    var targetUrl = serviceUrl + '/pubs/' + selectedPubId;
                    return $.ajax({
                        url: targetUrl,
                        method: 'DELETE'
                    });
                });
            }
            $.when.apply(this, removeDeferreds)
                .done(function() {
                    self.alertView.showSuccessAlert('Selected publications successfully removed from the current list.');
                })
                .fail(function() {
                    self.alertView.showDangerAlert('Error: Unable to remove the selected publications from the current list.');
                });
        },

        changePubsListFilter : function() {
            var pubsListFilter = [];
            this.$('.pub-filter-list-div input:checked').each(function() {
                pubsListFilter.push({
                    id: $(this).val()
                });
            });
            this.model.set('listId', {useId : true, selections : pubsListFilter});
            this.filterPubs();
        },

        /*
         * Model event handlers
         */
        updateQTerm : function() {
            var qTerm = this.model.has('q') ? this.model.get('q') : '';
            this.$('#search-term-input').val(qTerm);
        },
        updatePubsListFilter : function() {
            var pubsList = this.model.has('listId') ? _.pluck(this.model.get('listId').selections, 'id') : [];

            this.$('.pub-filter-container input[type="checkbox"]').each(function() {
                $(this).prop('checked', _.contains(pubsList, $(this).val()));
            });
        },

        updateVisibilityRemoveFromPubListBtn : function() {
            // ternary handles initial render when listId doesn't exist
            var selectedFilters = getFilters(this.model).listId ? getFilters(this.model).listId : [];
            var $removePubBtn = this.$('.remove-from-list-btn');
            var selectedFilter;
            var selectedText;
            if (selectedFilters.length === 1) {
                selectedFilter = _.first(selectedFilters);
                selectedText = this.publicationListCollection.findWhere({id : parseInt(selectedFilter)}).get('text');
                $removePubBtn.html('Remove Selected Publications From "' + selectedText + '" List');
                $removePubBtn.show();
            } else {
                $removePubBtn.hide();
            }
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
