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
	var AFFILIATION_COST_CENTER_INPUT = '#cost-center-input'
	var AFFILIATION_TYPE_OPTIONS = [
		{'id' : ''},
		{'id' : 1, 'text' : 'Cost Center'},
		{'id' : 2, 'text' : 'Outside Affiliation'}
	];
	var AFFILIATION_TYPE_DATA = {data : AFFILIATION_TYPE_OPTIONS};
	var LOADING_INDICATOR_SEL = '.loading-indicator';
	var ERRORS_SEL = '.validation-errors';
	var DELETE_BUTTON_SEL = '.delete-btn';
	var ALERT_CONTAINER_SEL = '.affiliation-alert-container';

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'click .save-btn' : 'saveAffiliation',
			'click .create-btn' : 'showCreateNewAffiliation',
			'click .cancel-btn' : 'resetFields',
			'select2:select #edit-affiliation-type-input' : 'enableAffiliationSelect',
			'select2:select #edit-affiliation-input' : 'showEditSelectedAffiliation'
		},

		bindings : {
			'#usgs-checkbox-input' : 'usgs',
			'#affiliation-input' : 'text',
			'#affiliation-active-input' : 'active'
		},

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			// Create child views
			this.alertView = new AlertView({
				el : ALERT_CONTAINER_SEL
			});
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
			this.stickit();
			this.alertView.setElement(this.$(ALERT_CONTAINER_SEL));
			self.$(AFFILIATION_TYPE_INPUT_SEL).select2(AFFILIATION_TYPE_DATA);
		},

		showEditSection : function() {
			this.$(EDIT_DIV).removeClass('hidden').addClass('show');
			this.$(CREATE_OR_EDIT_DIV).removeClass('show').addClass('hidden');
		},

		_isCostCenterSelected : function() {
			var isCostCenter;
			var affiliationTypeValue = this.$(AFFILIATION_TYPE_INPUT_SEL).val();
			if (affiliationTypeValue == 1 ) {
				isCostCenter = true;
			}
			else {
				isCostCenter = false;
			}
			return isCostCenter;
		},

		enableAffiliationSelect : function(ev) {
			this.$(AFFILIATION_INPUT_SEL).prop('disabled', false);
			var isCostCenter = this._isCostCenterSelected();
			var lookupType;
			if (isCostCenter) {
				lookupType = 'costcenters';
			}
			else {
				lookupType = 'outsideaffiliates';
			}
			var affiliationOptions = DynamicSelect2.getSelectOptions({
				lookupType : lookupType,
				activeSubgroup : true
			});
			this.$(AFFILIATION_INPUT_SEL).select2(affiliationOptions, DEFAULT_SELECT2_OPTIONS);
		},

		showCreateNewAffiliation : function(ev) {
			this.$(DELETE_BUTTON_SEL).prop('disabled', true);
			this.showEditSection();
		},

		resetFields : function(ev) {
			var self = this;
			var isCostCenter = this._isCostCenter();
			var modelId = this.model.get('id');
			this.model.clear();
			this.$(AFFILIATION_COST_CENTER_INPUT).prop('checked', false);
			this.model.set('id', modelId);
			this.model.fetch({}, isCostCenter)
				.fail(function() {
					self.alertView.showDangerAlert('Failed to fetch affiliation');
				});
		},

		showEditSelectedAffiliation : function(ev) {
			var self = this;
			var isCostCenter = this._isCostCenterSelected();
			var affiliationId = ev.currentTarget.value;
			var affiliationText = ev.currentTarget.selectedOptions[0].innerHTML;

			var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);

			this.model.set('id', affiliationId);
			var fetchedModel = this.model.fetch({}, isCostCenter);
			fetchedModel.done(function() {
				self.showEditSection();
				self.router.navigate('affiliation/' + affiliationId);
				var $costCenterInput = self.$(AFFILIATION_COST_CENTER_INPUT);
				if (isCostCenter) {
					$costCenterInput.prop('checked', true);
				}
				else {
					$costCenterInput.prop('checked', false);
				}
				self.$('#cost-center-input-div').prop('hidden', true);
			})
			.fail(function() {
				self.alertView.showDangerAlert('Failed to fetch affiliation ' + affiliationText + '.');
			})
			.always(function() {
				$loadingIndicator.hide();
			});
		},

		_isCostCenter : function() {
			var $costCenterInput = $(AFFILIATION_COST_CENTER_INPUT);
			var isChecked = $costCenterInput.is(':checked');
			return isChecked;
		},

		saveAffiliation : function() {
			var self = this;
			var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
			var $errorDiv = this.$(ERRORS_SEL);

			var isCostCenter = this._isCostCenter();
			$loadingIndicator.show();
			$errorDiv.html('');
			this.model.save({}, {}, isCostCenter)
				.done(function() {
					self.alertView.showSuccessAlert('Successfully saved the affiliation.');
					console.log(self.alertView);
					self.$(DELETE_BUTTON_SEL).prop('disabled', false);
					self.router.navigate('affiliation/' + self.model.get('id'));
				})
				.fail(function(jqxhr) {
					self.alertView.showDangerAlert('Unable to save the affiliation.');
					if ((jqxhr.responseJSON) && (jqxhr.responseJSON.validationErrors)) {
						$errorDiv.html('<pre>' + JSON.stringify(jqxhr.responseJSON.validationErrors) + '</pre>');
					}
				})
				.always(function() {
					$loadingIndicator.hide();
				});
		}
	});
	return view;
});