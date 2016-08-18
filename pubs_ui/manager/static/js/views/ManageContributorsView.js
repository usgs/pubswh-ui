/* jslint browser: true */
/* global define */

define([
	'jquery',
	'select2',
	'utils/DynamicSelect2',
	'views/BaseView',
	'hbs!hb_templates/manageContributors'
], function($, $select2, DynamicSelect2, BaseView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		theme : 'bootstrap'
	};

	var view = BaseView.extend({
		template: hbTemplate,

		events: {
			'select2:select .contributor-type-select': 'selectContributorType'
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			$(this.$('.contributor-type-select')).select2(DEFAULT_SELECT2_OPTIONS);
			$(this.$('.person-select-div select')).select2(DynamicSelect2.getSelectOptions({
				lookupType : 'people'
			}, DEFAULT_SELECT2_OPTIONS));
			$(this.$('.corporation-select-div select')).select2(DynamicSelect2.getSelectOptions({
				lookupType : 'corporations'
			}, DEFAULT_SELECT2_OPTIONS));
		},

		/*
		 * DOM event handlers
		 */

		selectContributorType : function(ev) {
			var type = ev.currentTarget.value;
			var $personSelectDiv = this.$('.person-select-div');
			var $corpSelectDiv = this.$('.corporation-select-div');
			this.$('.select-create-or-edit-container').show();
			switch(type) {
				case 'person':
					$personSelectDiv.show();
					$corpSelectDiv.hide();
					break;

				case 'corporation':
					$personSelectDiv.hide();
					$corpSelectDiv.show();
					break;
			}


		}
	});

	return view;
});