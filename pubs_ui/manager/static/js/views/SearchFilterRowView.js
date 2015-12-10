/* jslint browser : true */

define([
	'views/BaseView',
	'hbs!hbs_templates/searchFilterRow'
], function(BaseView, hb_template) {
	"use strict";

	var view = BaseView.extend({

		template : hb_template,

		events : {
			'change .search-category-input' : 'clearValue'
		},

		getFilter : function() {
			var category = $('.search-category-input').value();
			var value = $('.category-value-input').value();
			var result = {};

			if ((category) && (value)){
				result[category] = value;
			}
			return result;
		},

		clearValue : function(ev) {
			this.$('.category-value-input').val();
		}
	});

	return view;
})
