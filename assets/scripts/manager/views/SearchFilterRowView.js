import _ from 'underscore';
import $ from 'jquery';

import CostCenterCollection from '../models/CostCenterCollection';
import LinkTypeCollection from '../models/LinkTypeCollection';
import PublicationTypeCollection from '../models/PublicationTypeCollection';

import hbTemplate from '../hb_templates/searchFilterRow.hbs';
import optionTemplate from '../hb_templates/searchFilterRowOption.hbs';

import * as DynamicSelect2 from '../utils/DynamicSelect2';

import BaseView from './BaseView';


const DEFAULT_SELECT2_OPTIONS = {
    allowClear : true,
    theme : 'bootstrap'
};

export default BaseView.extend({
    template : hbTemplate,

    events : {
        'change .search-category-input' : 'changeCategory',
        'change .value-text-input' : 'changeValue',
        'change .value-boolean-input' : 'changeBooleanValue',
        'select2:select .value-select-input' : 'changeSelectedValue',
        'select2:unselect .value-select-input' : 'unsetSelectedValue',
        'click .delete-row' : 'remove'
    },

    /*
     * Used to create each category filter. Each element in the array should contain the following properties
     *     @prop id {String} - The string to use in the filter when selected
     *     @prop text {String} - The string displayed in the select
     *     @prop inputType {String, either 'text' or 'select'} - Indicates what the value field input should be
     *     @prop select2Init {Function which is passed the view's context} - Called to initialized the select2 field.
     *           Only required for inputType's of 'select'
     */
    categories: [
        {id: 'prodId', text: 'Prod ID', inputType: 'text'},
        {id: 'indexId', text: 'Index ID', inputType: 'text'},
        {id: 'ipdsId', text: 'IPDS', inputType: 'text'},
        {id: 'contributor', text: 'Contributor', inputType: 'text'},
        {id: 'title', text: 'Title', inputType: 'text'},
        {
            id: 'typeName',
            text: 'Publication Type',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                context.pubTypeFetch.done(function () {
                    $select.select2(_.extend({
                        data: context.publicationTypeCollection.toJSON()
                    }, DEFAULT_SELECT2_OPTIONS));
                    if (context.model.has('typeName') && context.model.attributes.typeName) {
                        const selections = context.model.get('typeName').selections;
                        $select.val(_.pluck(selections, 'id')).trigger('change');
                    }
                });
            }
        },
        {
            id: 'subtypeName',
            text: 'Publication Subtype',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                $select.select2(DynamicSelect2.getSelectOptions({
                    lookupType: 'publicationsubtypes'
                }, DEFAULT_SELECT2_OPTIONS));
                if (context.model.has('subtypeName') && context.model.attributes.subtypeName) {
                    const selections = context.model.get('subtypeName').selections;
                    // Add options for selections
                    _.each(selections, function (selection) {
                        if ($select.find('option[value="' + selection.id + '"]').length === 0) {
                            $select.append(optionTemplate(selection));
                        }
                    });
                    $select.val(_.pluck(selections, 'id')).trigger('change');
                }
            }
        },
        {
            id: 'seriesName',
            text: 'Series Title',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                $select.select2(DynamicSelect2.getSelectOptions({
                    lookupType: 'publicationseries',
                    subgroups: {
                        queryParameter: 'active',
                        nameAndValues: [{
                            name: 'Active',
                            value: 'true'
                        }, {
                            name: 'Not Active',
                            value: 'false'
                        }]
                    }
                }, DEFAULT_SELECT2_OPTIONS));
                if (context.model.has('seriesName') && context.model.attributes.seriesName) {
                    const selections = context.model.get('seriesName').selections;
                    // Add options for selections
                    _.each(selections, function (selection) {
                        if ($select.find('option[value="' + selection.id + '"]').length === 0) {
                            $select.append(optionTemplate(selection));
                        }
                    });
                    $select.val(_.pluck(selections, 'id')).trigger('change');
                }
            }
        },
        {
            id: 'contributingOffice',
            text: 'Cost Center',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                context.costCenterPromise.done(function () {
                    $select.select2(_.extend({
                        data: [{
                            text: 'Active',
                            children: context.activeCostCenters.toJSON()
                        }, {
                            text: 'Not Active',
                            children: context.notActiveCostCenters.toJSON()
                        }]
                    }, DEFAULT_SELECT2_OPTIONS));
                    if (context.model.has('contributingOffice') && context.model.attributes.contributingOffice) {
                        const selections = context.model.get('contributingOffice').selections;
                        $select.val(_.pluck(selections, 'id')).trigger('change');
                    }
                });
            }
        },
        {id: 'year', text: 'Year', inputType: 'text'},
        {id: 'chorus', text: 'Is Chorus', inputType: 'boolean'},
        {id: 'doi', text: 'DOI', inputType: 'text'},
        {id: 'endYear', text: 'End Year', inputType: 'text'},
        {id: 'global', text: 'Global', inputType: 'text'},
        {id: 'hasDOI', text: 'Has DOI', inputType: 'boolean'},
        {
            id: 'linkType',
            text: 'Link Type',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                context.linkTypeFetch.done(function () {
                    $select.select2(_.extend({
                        data: context.linkTypeCollection.toJSON()
                    }, DEFAULT_SELECT2_OPTIONS));
                    if (context.model.has('linkType') && context.model.attributes.linkType) {
                        const selections = context.model.get('linkType').selections;
                        $select.val(_.pluck(selections, 'id')).trigger('change');
                    }
                });
            }
        },
        {id: 'modDateHigh', text: 'Modified After (yyyy-mm-dd)', inputType: 'text'},
        {id: 'modDateLo', text: 'Modified Before (yyyy-mm-dd)', inputType: 'text'},
        {id: 'modXDays', text: 'Modified in the last X Days', inputType: 'text'},
        {
            id: 'noLinkType',
            text: 'Missing Link Type',
            inputType: 'select',
            select2Init: function (context) {
                const $select = context.$('.value-select-input');
                context.linkTypeFetch.done(function () {
                    $select.select2(_.extend({
                        data: context.linkTypeCollection.toJSON()
                    }, DEFAULT_SELECT2_OPTIONS));
                    if (context.model.has('noLinkType') && context.model.attributes.noLinkType) {
                        const selections = context.model.get('noLinkType').selections;
                        $select.val(_.pluck(selections, 'id')).trigger('change');
                    }
                });
            }
        },
        {id: 'orcid', text: 'ORCID', inputType: 'text'},
        {id: 'pubAbstract', text: 'Abstract', inputType: 'text'},
        {id: 'pubDateHigh', text: 'Published in or before (YYYY-MM-DD)', inputType: 'text'},
        {id: 'pubDateLow', text: 'Published starting in (YYYY-MM-DD)', inputType: 'text'},
        {id: 'pubXdays', text: 'Published in the last X days', inputType: 'text'},
        {id: 'reportNumber', text: 'Report Number', inputType: 'text'},
        {id: 'startYear', text: 'Start Year', inputType: 'text'}
    ],

    /*
     * @constructs
     * @param options
     *     @prop {Backbone.Model} model
     *     @prop {String} el
     *     @prop {String} initialCategory
     */
     initialize : function(options) {
        const isCategoryId = function(category) {
            return options.initialCategory === category.id;
        };
        BaseView.prototype.initialize.apply(this, arguments);
        this.initialCategory = options.initialCategory ? _.find(this.categories, isCategoryId) : undefined;

        this.publicationTypeCollection = new PublicationTypeCollection();
        this.pubTypeFetch = this.publicationTypeCollection.fetch();

        this.linkTypeCollection = new LinkTypeCollection();
        this.linkTypeFetch = this.linkTypeCollection.fetch();

        this.activeCostCenters = new CostCenterCollection();
        this.notActiveCostCenters = new CostCenterCollection();
        this.costCenterPromise = $.when(
            this.activeCostCenters.fetch({data : {active : 'true'}}),
            this.notActiveCostCenters.fetch({data : {active : 'false'}})
            );

        this.listenTo(this.model, 'change', this.disableFilterOption);
    },

    render : function() {
        this.context.initialCategoryId = this.initialCategory ? this.initialCategory.id : undefined;
        this.context.categories = _.map(this.categories, function (category) {
            let result = _.clone(category);
            result.disabled = this.model.has(result.id);
            result.selected = this.initialCategory ? result.id === this.initialCategory.id : false;
            return result;
        }, this);

        BaseView.prototype.render.apply(this, arguments);
        this.$('.search-category-input').select2(DEFAULT_SELECT2_OPTIONS);

        if (this.initialCategory) {
            if (this.initialCategory.inputType === 'select') {
                this.initialCategory.select2Init(this);
                this.$('.select-input-div').show();
                this.$('.text-input-div').hide();
            } else if (this.initialCategory.inputType === 'boolean') {
                this.$('.value-boolean-input').prop('checked', this.model.get(this.initialCategory.id) === 'true');
                this.$('.boolean-input-div').show();
                this.$('.text-input-div').hide();
            } else {
                this.$('.value-text-input').val(this.model.get(this.initialCategory.id));
            }
        } else {
            // Dummy initialization of the value select2
            this.$('.value-select-input').select2(DEFAULT_SELECT2_OPTIONS);
        }
    },

    remove : function() {
        const category = this.$('.search-category-input').data('current-value');
        this.model.unset(category);

        BaseView.prototype.remove.apply(this, arguments);
    },

    /*
     * Model event handlers
     */
     disableFilterOption : function(model, options) {
        const $option = this.$('.search-category-input option[value="' + options.changedAttribute + '"]');
        const enabled = _.has(options, 'unset') && options.unset;
        $option.prop('disabled', !enabled);
    },

    /*
     * DOM event handlers
     */
     changeCategory : function(ev) {
        const $thisEl = $(ev.currentTarget);
        const $textInputDiv = this.$('.text-input-div');
        const $selectInputDiv = this.$('.select-input-div');
        const $booleanInputDiv = this.$('.boolean-input-div');
        const $select = $selectInputDiv.find('select');

        const oldValue = $thisEl.data('current-value');
        const newValue = ev.currentTarget.value;
        const selectedCategory = _.find(this.categories, (category) => category.id === newValue);

        // Clear input fields
        $textInputDiv.find('input').val('');
        $select.val('');
        $booleanInputDiv.prop('checked', false);
        // Show/hide the appropriate input div and perform any initialization
        if (!selectedCategory || selectedCategory.inputType === 'text') {
            if (selectedCategory) {
                $textInputDiv.find('input').val(this.model.get(selectedCategory.id));
            }

            $textInputDiv.show();
            $booleanInputDiv.hide();
            $selectInputDiv.hide();
        } else if (selectedCategory.inputType === 'boolean') {
            $textInputDiv.hide();
            $booleanInputDiv.show();
            $selectInputDiv.hide();
        } else {
            $textInputDiv.hide();
            $booleanInputDiv.hide();

            $select.select2('destroy');
            $select.html('');
            selectedCategory.select2Init(this);

            $selectInputDiv.show();
        }

        // Set model value for the current category and remove the old category if necessary.
        // Then update the data-current-value attribute.
        this.model.set(ev.currentTarget.value, '', {changedAttribute : ev.currentTarget.value});
        if (oldValue) {
            this.model.unset(oldValue, {changedAttribute: oldValue});
        }
        $thisEl.data('current-value', ev.currentTarget.value);
    },

    changeValue : function(ev) {
        const category = this.$('.search-category-input').data('current-value');
        this.model.set(category, ev.currentTarget.value);
    },

    changeBooleanValue: function (ev) {
        const category = this.$('.search-category-input').data('current-value');
        this.model.set(category, ev.currentTarget.checked ? 'true' : 'false');
    },

    changeSelectedValue : function(ev) {
        const $categorySelect = this.$('.search-category-input');
        const category = $categorySelect.data('current-value');
        const useId = $categorySelect.find('option[value="' + category + '"]').data('sendid');
        const categorySelections = this.model.has(category) && this.model.attributes[category] ? this.model.get(category).selections : [];
        categorySelections.push({
            id : parseInt(ev.params.data.id),
            text : ev.params.data.text
        });
        this.model.set(category, {
            useId: useId,
            selections: categorySelections
        });
    },

    unsetSelectedValue : function(ev) {
        const $categorySelect = this.$('.search-category-input');
        const category = $categorySelect.data('current-value');
        const useId = $categorySelect.find('option[value="' + category + '"]').data('sendid');
        const categorySelections = this.model.has(category) && this.model.attributes[category] ? this.model.get(category).selections : [];
        const selectionToRemove = parseInt(ev.params.data.id);
        this.model.set(category, {
            useId : useId,
            selections : _.reject(categorySelections, function(selection) {
                return selection.id === selectionToRemove;
            })
        });
    }
});
