/* jslint browser : true */

define([
	'underscore',
	'jquery',
	'utils/DynamicSelect2',
	'models/PublicationTypeCollection',
	'views/BaseView',
	'hbs!hb_templates/searchFilterRow'
], function(_, $, DynamicSelect2, PublicationTypeCollection, BaseView, hb_template) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		allowClear : true,
		theme : 'bootstrap'
	};

	var view = BaseView.extend({

		template : hb_template,

		events : {
			'change .search-category-input' : 'changeCategory',
			'change .value-text-input' : 'changeValue',
			'change .value-select-input' : 'changeSelectedValue'
		},

		search_categories : [
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
					context.pubTypeFetch.done(function() {
						context.$('.value-select-input').select2(_.extend({
							data : context.publicationTypeCollection.toJSON()
						}, DEFAULT_SELECT2_OPTIONS))
					});
				}
			},
			{
				id : 'subtypeName',
				text : 'Publication Subtype',
				inputType : 'select',
				select2Init : function(context) {
					context.$('.value-select-input').select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationsubtypes'
					}, DEFAULT_SELECT2_OPTIONS))
				}
			},
			{
				id : 'seriesName',
				text : 'Series Title',
				inputType : 'select',
				select2Init : function(context) {
					context.$('.value-select-input').select2(DynamicSelect2.getSelectOptions({
						lookupType : 'publicationseries',
						activeSubgroup : true
					}, DEFAULT_SELECT2_OPTIONS))
				}
			},
			{id : 'year', text : 'Year', inputType : 'text'}
		],

		/*
		 * @constructs
		 * @param options
		 *     @prop {Backbone.Model} model
		 *     @prop {String} el
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.publicationTypeCollection = new PublicationTypeCollection();
			this.pubTypeFetch = this.publicationTypeCollection.fetch();
			this.listenTo(this.model, 'change', this.disableFilterOption);
		},

		render : function() {
			this.context.categories = _.map(this.search_categories, function(category) {
				var result = _.clone(category);
				result['disabled'] = this.model.has(result.id);
				return result;
			}, this);

			BaseView.prototype.render.apply(this, arguments);
			// Dummy initialization of the select2
			this.$('.value-select-input').select2(DEFAULT_SELECT2_OPTIONS);
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
			var selectedCategory = _.find(this.search_categories, function(category) {
				return category.id === newValue
			});

			// Show/hide the appropriate input div and perform any initialization
			if ((!selectedCategory) || (selectedCategory.inputType === 'text')) {
				$textInputDiv.show();
				$selectInputDiv.hide();
			}
			else {
				$textInputDiv.hide();

				$select.select2('destroy');
				selectedCategory.select2Init(this);
				$selectInputDiv.show();
			}

			// Clear input fields
			$textInputDiv.find('input').val('');
			$select.val('');

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
			var category = this.$('.search-category-input').data('current-value');
			this.model.set(category, _.pluck(ev.currentTarget.selectedOptions, 'innerHTML'));
		}
	});

	return view;
})
