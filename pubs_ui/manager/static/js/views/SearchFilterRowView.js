/* jslint browser : true */
/* global define */

define([
	'underscore',
	'jquery',
	'utils/DynamicSelect2',
	'models/PublicationTypeCollection',
	'views/BaseView',
	'hbs!hb_templates/searchFilterRow'
], function(_, $, DynamicSelect2, PublicationTypeCollection, BaseView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		allowClear : true,
		theme : 'bootstrap'
	};

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'change .search-category-input' : 'changeCategory',
			'change .value-text-input' : 'changeValue',
			'change .value-select-input' : 'changeSelectedValue',
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
				select2Init : function(context, initValue) {
					var $select = context.$('.value-select-input');
					context.pubTypeFetch.done(function() {
						$select.select2(_.extend({
							data : context.publicationTypeCollection.toJSON()
						}, DEFAULT_SELECT2_OPTIONS));
						if (initValue) {
							$select.val(initValue);
						}
					});

				}
			},
			{
				id : 'subtypeName',
				text : 'Publication Subtype',
				inputType : 'select',
				select2Init : function(context, initValue) {
					context.$('.value-select-input').select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationsubtypes'
					}, DEFAULT_SELECT2_OPTIONS));
				}
			},
			{
				id : 'seriesName',
				text : 'Series Title',
				inputType : 'select',
				select2Init : function(context, initValue) {
					context.$('.value-select-input').select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationseries',
						activeSubgroup : true
					}, DEFAULT_SELECT2_OPTIONS));
				}
			},
			{id : 'year', text : 'Year', inputType : 'text'}
		],

		/*
		 * @constructs
		 * @param options
		 *     @prop {Backbone.Model} model
		 *     @prop {String} el
		 *     @prop {Object} filter (optional) - Should be a two element array of a filter key and valuethat will be used to initialize this row.
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.initFilter = options.filter;

			this.publicationTypeCollection = new PublicationTypeCollection();
			this.pubTypeFetch = this.publicationTypeCollection.fetch();

			this.listenTo(this.model, 'change', this.disableFilterOption);
		},

		render : function() {
			var $searchCategoryInput = this.$('.search-category-input');
			this.context.categories = _.map(this.categories, function(category) {
				var result = _.clone(category);
				result.disabled = this.model.has(result.id);
				result.selected = (this.initFilter) ? result.id === this.initFilter[0] : false;
				return result;
			}, this);

			BaseView.prototype.render.apply(this, arguments);
			$searchCategoryInput.select2(DEFAULT_SELECT2_OPTIONS);
			// Dummy initialization of the value select2
			this.$('.value-select-input').select2(DEFAULT_SELECT2_OPTIONS);

			if (this.initFilter) {
				this._setCategoryInput(_.find(this.categories, function(category) {
					return category.id === this.initFilter[0];
				}, this), this.initFilter[1]);
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

		_setCategoryInput : function(selectedCategory, initValue) {
			var $textInputDiv = this.$('.text-input-div');
			var $textInput = $textInputDiv.find('input');
			var $selectInputDiv = this.$('.select-input-div');
			var $select = $selectInputDiv.find('select');
			// Show/hide the appropriate input div and perform any initialization
			if ((!selectedCategory) || (selectedCategory.inputType === 'text')) {
				$textInputDiv.show();
				$textInput.val((initValue) ? initValue[0] : '');
				$selectInputDiv.hide();
				$selectInputDiv.val('');
			}
			else {
				$textInputDiv.hide();
				$textInput.val('');

				$select.select2('destroy');
				$select.html('');
				selectedCategory.select2Init(this, initValue);
				$selectInputDiv.show();
			}
			this.$('.search-category-input').data('current-value', (_.has(selectedCategory, 'id') ? selectedCategory.id : ''));
		},

		/*
		 * DOM event handlers
		 */
		changeCategory : function(ev) {
			var $thisEl = $(ev.currentTarget);

			var oldValue = $thisEl.data('current-value');
			var newValue = ev.currentTarget.value;
			var selectedCategory = _.find(this.categories, function(category) {
				return category.id === newValue;
			});

			this._setCategoryInput(selectedCategory);

			// Set model value for the current category and remove the old category if necessary.
			this.model.set(ev.currentTarget.value, '', {changedAttribute : ev.currentTarget.value});
			if (oldValue) {
				this.model.unset(oldValue, {changedAttribute: oldValue});
			}
		},

		changeValue : function(ev) {
			var category = this.$('.search-category-input').data('current-value');
			this.model.set(category, ev.currentTarget.value);
		},

		changeSelectedValue : function(ev) {
			var $categorySelect = this.$('.search-category-input');
			var category = $categorySelect.data('current-value');
			var useId = $categorySelect.find('option[value="' + category + '"]').data('sendid');
			if (useId) {
				this.model.set(category, _.pluck(ev.currentTarget.selectedOptions, 'value'));
			}
			else {
				this.model.set(category, _.pluck(ev.currentTarget.selectedOptions, 'innerHTML'));
			}
		}
	});

	return view;
});
