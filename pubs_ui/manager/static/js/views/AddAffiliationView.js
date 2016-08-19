/* jslint browser:true */

define([
	'jquery',
	'underscore',
	'backbone.stickit',
	'bootstrap',
	'utils/DynamicSelect2',
	'views/BaseView',
	'views/AlertView',
	'models/AffiliationModel',
	'models/AffiliationCollection',
	'hbs!hb_templates/manageAffiliations'
], function($, _, stickit, bootstrap, DynamicSelect2, BaseView, AlertView,
			AffiliationModel, AffiliationCollection, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		theme : 'bootstrap'
	};

	var EDIT_DIV = '.edit-div';
	var CREATE_OR_EDIT_DIV = '.create-or-edit-div';
	var AFFILIATION_TYPE_INPUT_SEL = '#edit-affiliation-type-input';
	var AFFILIATION_INPUT_SEL = '#edit-affiliation-input';
	var AFFILIATION_TYPE_OPTIONS = [
		{'id' : ''},
		{'id' : 1, 'text' : 'Cost Center'},
		{'id' : 2, 'text' : 'Outside Affiliation'}
	];
	var AFFILIATION_TYPE_DATA = {data : AFFILIATION_TYPE_OPTIONS};

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'click .save-btn' : 'saveAffiliation',
			'click .create-btn' : 'showCreateNewAffiliation',
			'click .cancel-btn' : 'resetFields',
			'select2:select #edit-affiliation-type-input' : 'enableAffiliationSelect'
		},

		bindings : {
			'#usgs-checkbox-input' : 'usgs',
			'#affiliation-input' : 'text',
			'#affiliation-active-input' : 'active'
		},

		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);
			if (this.model.isNew()) {
				this.fetchPromise = $.Deferred().resolve();
			}
			else {
				var fetchOptions = {
					success: (function() {
						alert('Success!');
					}),
					error: (function() {
						//alert('Error!');
						throw '404 Found';
					})
				};
				this.fetchPromise = this.model.fetch(fetchOptions);
			}
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
			this.stickit();
			self.$(AFFILIATION_TYPE_INPUT_SEL).select2(AFFILIATION_TYPE_DATA);
		},

		showEditSection : function() {
			this.$(EDIT_DIV).removeClass('hidden').addClass('show');
			this.$(CREATE_OR_EDIT_DIV).removeClass('show').addClass('hidden');
		},

		enableAffiliationSelect : function(ev) {
			this.$(AFFILIATION_INPUT_SEL).prop('disabled', false);
			var isCostCenter;
			var affiliationTypeValue = this.$(AFFILIATION_TYPE_INPUT_SEL).val();
			console.log(affiliationTypeValue);
			if (affiliationTypeValue == 1) {
				isCostCenter = true;
			}
			else {
				isCostCenter = false;
			}
			this.affiliationCollection = new AffiliationCollection();
			this.affiliationCollectionPromise = this.affiliationCollection.fetch({}, isCostCenter);
			var self = this;
			this.affiliationCollectionPromise.done(function() {
				var affiliationData = self.affiliationCollection.toJSON();
				var affiliationOptions = _.extend({
					data : [{id : ''}].concat(affiliationData)
				});
				self.$(AFFILIATION_INPUT_SEL).select2(affiliationOptions);
			});
		},

		showCreateNewAffiliation : function(ev) {
			this.showEditSection();
		},

		resetFields : function(ev) {
			var self = this;
			var modelId = this.model.get('id');
			this.model.clear();
			this.model.set('id', modelId);
			this.model.fetch()
				.fail(function() {
					self.alertView.showDangerAlert('Failed to fetch affiliation');
				});
		},

		_isCostCenter : function() {
			var $costCenterInput = $('#cost-center-input');
			var isChecked = $costCenterInput.is(':checked');
			return isChecked;
		},

		saveAffiliation : function() {
			var isCostCenter = this._isCostCenter();
			this.model.save({}, {}, isCostCenter);
		}
	});
	return view;
});