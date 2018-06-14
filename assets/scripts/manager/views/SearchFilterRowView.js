
/* jslint browser : true */
/* global define */

define([
	'underscore',
	'jquery',
	'handlebars',
	'utils/DynamicSelect2',
	'models/PublicationTypeCollection',
	'models/CostCenterCollection',
	'views/BaseView',
	'hbs!hb_templates/searchFilterRow'
], function(_, $, Handlebars, DynamicSelect2, PublicationTypeCollection, CostCenterCollection, BaseView, hbTemplate) {
	'use strict';

	var DEFAULT_SELECT2_OPTIONS = {
		allowClear : true,
		theme : 'bootstrap'
	};

	var OPTIONS_TEMPLATE = Handlebars.compile('<option value={{id}}>{{text}}</option>');

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'change .search-category-input' : 'changeCategory',
			'change .value-text-input' : 'changeValue',
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
		categories : [
			{id : 'prodId', text : 'Prod ID', inputType : 'text'},
			{id : 'indexId', text : 'Index ID', inputType : 'text'},
			{id : 'ipdsId', text : 'IPDS', inputType : 'text'},
			{id : 'contributor', text : 'Contributor', inputType : 'text'},
			{id : 'title', text : 'Title', inputType : 'text'},
			{
				id : 'typeName',
				text : 'Publication Type',
				inputType : 'select',
				select2Init : function(context) {
					var $select = context.$('.value-select-input');
					context.pubTypeFetch.done(function() {
						$select.select2(_.extend({
							data : context.publicationTypeCollection.toJSON()
						}, DEFAULT_SELECT2_OPTIONS));
						if (context.model.has('typeName') && context.model.attributes.typeName) {
							var selections = context.model.get('typeName').selections;
							$select.val(_.pluck(selections, 'id')).trigger('change');
						}
					});
				}
			},
			{
				id : 'subtypeName',
				text : 'Publication Subtype',
				inputType : 'select',
				select2Init : function(context) {
					var $select = context.$('.value-select-input');
					$select.select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationsubtypes'
					}, DEFAULT_SELECT2_OPTIONS));
					if (context.model.has('subtypeName') && context.model.attributes.subtypeName) {
						var selections = context.model.get('subtypeName').selections;
						// Add options for selections
						_.each(selections, function(selection) {
							if ($select.find('option[value="' + selection.id + '"]').length === 0) {
								$select.append(OPTIONS_TEMPLATE(selection));
							}
						});
						$select.val(_.pluck(selections, 'id')).trigger('change');
					}
				}
			},
			{
				id : 'seriesName',
				text : 'Series Title',
				inputType : 'select',
				select2Init : function(context) {
					var $select = context.$('.value-select-input');
					$select.select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationseries',
						activeSubgroup : true
					}, DEFAULT_SELECT2_OPTIONS));
					if (context.model.has('seriesName') && context.model.attributes.seriesName) {
						var selections = context.model.get('seriesName').selections;
						// Add options for selections
						_.each(selections, function(selection) {
							if ($select.find('option[value="' + selection.id + '"]').length === 0) {
								$select.append(OPTIONS_TEMPLATE(selection));
							}
						});
						$select.val(_.pluck(selections, 'id')).trigger('change');
					}
				}
			},
			{
				id : 'contributingOffice',
				text : 'Cost Center',
				inputType : 'select',
				select2Init : function(context) {
					var $select = context.$('.value-select-input');
					context.costCenterPromise.done(function() {
						$select.select2(_.extend({
							data : [{
								text : 'Active',
								children : context.activeCostCenters.toJSON()
							}, {
								text : 'Not Active',
								children : context.notActiveCostCenters.toJSON()
							}]
						}, DEFAULT_SELECT2_OPTIONS));
						if (context.model.has('contributingOffice') && context.model.attributes.contributingOffice) {
							var selections = context.model.get('contributingOffice').selections;
							$select.val(_.pluck(selections, 'id')).trigger('change');
						}
					});
				}
			},
			{id : 'year', text : 'Year', inputType : 'text'}
		],

		/*
		 * @constructs
		 * @param options
		 *     @prop {Backbone.Model} model
		 *     @prop {String} el
		 *     @prop {String} initialCategory
		 */
		initialize : function(options) {
			var isCategoryId = function(category) {
				return options.initialCategory === category.id;
			};
			BaseView.prototype.initialize.apply(this, arguments);
			this.initialCategory = options.initialCategory ? _.find(this.categories, isCategoryId) : undefined;

			this.publicationTypeCollection = new PublicationTypeCollection();
			this.pubTypeFetch = this.publicationTypeCollection.fetch();

			this.activeCostCenters = new CostCenterCollection();
			this.notActiveCostCenters = new CostCenterCollection();
			this.costCenterPromise = $.when(
					this.activeCostCenters.fetch({data : {active : 'y'}}),
					this.notActiveCostCenters.fetch({data : {active : 'n'}})
			);

			this.listenTo(this.model, 'change', this.disableFilterOption);
		},

		render : function() {
			this.context.initialCategoryId = this.initialCategory ? this.initialCategory.id : undefined;
			this.context.categories = _.map(this.categories, function (category) {
				var result = _.clone(category);
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
				} else {
					this.$('.value-text-input').val(this.model.get(this.initialCategory.id));
				}
			} else {
				// Dummy initialization of the value select2
				this.$('.value-select-input').select2(DEFAULT_SELECT2_OPTIONS);
			}
		},

		remove : function() {
			var category = this.$('.search-category-input').data('current-value');
			this.model.unset(category);

			BaseView.prototype.remove.apply(this, arguments);
		},

		/*
		 * Model event handlers
		 */
		disableFilterOption : function(model, options) {
			var $option = this.$('.search-category-input option[value="' + options.changedAttribute + '"]');
			var enabled = _.has(options, 'unset') && options.unset;
			$option.prop('disabled', !enabled);
		},

		/*
		 * DOM event handlers
		 */
		changeCategory : function(ev) {
			var $thisEl = $(ev.currentTarget);
			var $textInputDiv = this.$('.text-input-div');
			var $selectInputDiv = this.$('.select-input-div');
			var $select = $selectInputDiv.find('select');

			var oldValue = $thisEl.data('current-value');
			var newValue = ev.currentTarget.value;
			var selectedCategory = _.find(this.categories, function(category) {
				return category.id === newValue;
			});

			// Clear input fields
			$textInputDiv.find('input').val('');
			$select.val('');
			// Show/hide the appropriate input div and perform any initialization
			if (!selectedCategory || selectedCategory.inputType === 'text') {
				if (selectedCategory) {
					$textInputDiv.find('input').val(this.model.get(selectedCategory.id));
				}

				$textInputDiv.show();
				$selectInputDiv.hide();
			} else {
				$textInputDiv.hide();

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
			var category = this.$('.search-category-input').data('current-value');
			this.model.set(category, ev.currentTarget.value);
		},

		changeSelectedValue : function(ev) {
			var $categorySelect = this.$('.search-category-input');
			var category = $categorySelect.data('current-value');
			var useId = $categorySelect.find('option[value="' + category + '"]').data('sendid');
			var categorySelections = this.model.has(category) && this.model.attributes[category] ? this.model.get(category).selections : [];
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
			var $categorySelect = this.$('.search-category-input');
			var category = $categorySelect.data('current-value');
			var useId = $categorySelect.find('option[value="' + category + '"]').data('sendid');
			var categorySelections = this.model.has(category) && this.model.attributes[category] ? this.model.get(category).selections : [];
			var selectionToRemove = parseInt(ev.params.data.id);
			this.model.set(category, {
				useId : useId,
				selections : _.reject(categorySelections, function(selection) {
					return selection.id === selectionToRemove;
				})
			});
		}
	});

	return view;
});
