/* jslint browser : true */

define([
	'jquery',
	'views/BaseView',
	'hbs!hb_templates/searchFilterRow'
], function($, BaseView, hb_template) {
	"use strict";

	var SEARCH_CATEGORIES = [
		{id : 'prodId', text : 'Prod ID', inputType : 'text'},
		{id : 'indexId', text : 'Index ID', inputType : 'text'},
		{id : 'ipdsId', text : 'IPDS', inputType : 'text'},
		{id : 'contributor', text : 'Contributor', inputType : 'text'},
		{id : 'title', text : 'Title', inputType : 'text'},
		{id : 'typeName', text : 'Publication Type', inputType : 'select'},
		{id : 'subtypeName', text : 'Publication Subtype', inputType : 'select'},
		{id : 'seriesName', text : 'Series Title', inputType : 'select'},
		{id : 'year', text : 'Year', inputType : 'text'}
	]

	var view = BaseView.extend({

		template : hb_template,

		events : {
			'change .search-category-input' : 'changeCategory',
			'change .value-text-input' : 'changeValue'
		},

		/*
		 * @constructs
		 * @param options
		 *     @prop {SearchFilterModel} model
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change', this.disableFilterOption);
		},

		render : function() {
			this.context.categories = _.map(SEARCH_CATEGORIES, function(category) {
				var result = _.clone(category);
				result['disabled'] = this.model.has(result.id);
				return result;
			}, this);

			BaseView.prototype.render.apply(this, arguments);
		},

		disableFilterOption : function(model, options) {
			var $option = this.$('.search-category-input option[value="' + options.changedAttribute + '"]');
			var enabled = _.has(options, 'unset') && options.unset;
			$option.prop('disabled', !enabled);
		},

		changeCategory : function(ev) {
			var $thisEl = $(ev.currentTarget);
			var oldValue = $thisEl.data('current-value');
			//
			this.$('.value-text-input').val();

			this.model.set(ev.currentTarget.value, '', {changedAttribute : ev.currentTarget.value});
			if (oldValue) {
				this.model.unset(oldValue, {changedAttribute: oldValue});
			}
			$thisEl.data('current-value', ev.currentTarget.value);
		},

		changeValue : function(ev) {
			var category = this.$('.search-category-input').data('current-value');
			this.model.set(category, ev.currentTarget.value);
		}
	});

	return view;
})
