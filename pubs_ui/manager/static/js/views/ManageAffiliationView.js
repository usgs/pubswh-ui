/* jslint browser:true */

define([
	'jquery',
	'underscore',
	'backbone.stickit',
	'bootstrap',
	'views/BaseView',
	'views/AlertView',
	'models/AffiliationModel',
	'models/CostCenterCollection',
	'models/OutsideAffiliationLookupCollection',
	'hbs!hb_templates/manageAffiliations'
], function($, _, stickit, bootstrap, BaseView, AlertView,
			AffiliationModel, CostCenterCollection, OutsideAffiliationCollection, hbTemplate) {
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
	var LOADING_INDICATOR_SEL = '.loading-indicator';
	var ERRORS_SEL = '.validation-errors';
	var DELETE_BUTTON_SEL = '.delete-btn';
	var ALERT_CONTAINER_SEL = '.affiliation-alert-container';
	var CREATE_NEW_AFFILIATION = '.create-btn';

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'click .save-btn' : 'saveAffiliation',
			'click .create-btn' : 'showCreateNewAffiliation',
			'click .cancel-btn' : 'resetFields',
			'click .delete-ok-btn' : 'deleteAffiliation',
			'click .create-new-btn' : 'clearPage',
			'select2:select #edit-affiliation-type-input' : 'enableAffiliationSelect',
			'select2:select #edit-affiliation-input' : 'showEditSelectedAffiliation'
		},

		bindings : {
			'#affiliation-input' : 'text',
			'#affiliation-active-input' : 'active'
		},

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			// Create child views
			this.alertView = new AlertView({
				el : ALERT_CONTAINER_SEL
			});
			// Cost Center identification attribute
			this.affiliationIsCostCenter = null;
			this.activeCostCenters = new CostCenterCollection();
			this.inactiveCostCenters = new CostCenterCollection();
			this.costCenterPromise = $.when(
				this.activeCostCenters.fetch({data : {active : 'y'}}),
				this.inactiveCostCenters.fetch({data : {active : 'n'}})
			);
			this.activeOutsideAffiliates = new OutsideAffiliationCollection();
			this.inactiveOutsideAffiliates = new OutsideAffiliationCollection();
			this.outsideAffiliatesPromise = $.when(
				this.activeOutsideAffiliates.fetch({data : {active : 'y'}}),
				this.inactiveOutsideAffiliates.fetch({data : {active : 'n'}})
			);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
			this.stickit();
			this.alertView.setElement(this.$(ALERT_CONTAINER_SEL));
			self.$(AFFILIATION_TYPE_INPUT_SEL).select2(AFFILIATION_TYPE_DATA, DEFAULT_SELECT2_OPTIONS);
		},

		_isCostCenterSelected : function() {
			var isCostCenter;
			var affiliationTypeValue = this.$(AFFILIATION_TYPE_INPUT_SEL).val();
			if (affiliationTypeValue == 1 ) {
				isCostCenter = true;
			}
			else if (affiliationTypeValue == 2 ) {
				isCostCenter = false;
			}
			else {
				isCostCenter = null;
			}
			return isCostCenter;
		},

		showEditSection : function() {
			this.$(EDIT_DIV).removeClass('hidden').addClass('show');
			this.$(CREATE_OR_EDIT_DIV).removeClass('show').addClass('hidden');
		},

		hideEditSection : function() {
			// reset initial affiliation select values
			this.$(AFFILIATION_TYPE_INPUT_SEL).val('').trigger('change');
			this.$(AFFILIATION_INPUT_SEL).prop('disabled', true).val('').trigger('change');
			// hide edit fields
			this.$(EDIT_DIV).removeClass('show').addClass('hidden');
			this.$(CREATE_OR_EDIT_DIV).removeClass('hidden').addClass('show');

			this.alertView.closeAlert();
			this.$(ERRORS_SEL).html('');
		},

		enableAffiliationSelect : function(ev) {
			var self = this;
			this.$(AFFILIATION_INPUT_SEL).prop('disabled', false);
			this.$(CREATE_NEW_AFFILIATION).prop('disabled', false);
			this.affiliationIsCostCenter = this._isCostCenterSelected();
			var selectOptions;
			if (this.affiliationIsCostCenter) {
				this.costCenterPromise.done(function() {
					self.$(AFFILIATION_INPUT_SEL).select2(_.extend({
						data : [{
							text : 'Active',
							children : self.activeCostCenters.toJSON()
						}, {
							text : 'Not Active',
							children : self.inactiveCostCenters.toJSON()
						}]
					}, DEFAULT_SELECT2_OPTIONS));
				});
			}
			else {
				this.outsideAffiliatesPromise.done(function() {
					self.$(AFFILIATION_INPUT_SEL).select2(_.extend({
						data : []
					}))
				});
			}
		},

		showCreateNewAffiliation : function(ev) {
			this.model.clear();
			this.$(DELETE_BUTTON_SEL).prop('disabled', true);
			this.showEditSection();
		},

		clearPage : function(ev) {
			this.hideEditSection();
			this.model.clear();
			this.router.navigate('affiliation', {trigger : true});
			this.render();
		},

		resetFields : function(ev) {
			var self = this;
			this.affiliationIsCostCenter = this._isCostCenterSelected();
			var modelId = this.model.get('id');
			this.model.clear();
			this.model.set('id', modelId);
			this.model.fetch({}, this.affiliationIsCostCenter)
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
			})
			.fail(function() {
				self.alertView.showDangerAlert('Failed to fetch affiliation ' + affiliationText + '.');
			})
			.always(function() {
				$loadingIndicator.hide();
			});
		},

		deleteAffiliation : function(ev) {
			var self = this;
			var affiliationName = this.model.get('text');
			var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
			$loadingIndicator.show();
			// do not need to determine if affiliation is a cost center
			// a fetch needs to occur before a delete happens, so the cost center determination is done then
			this.model.destroy({wait : true})
				.done(function() {
					self.router.navigate('affiliation');
					self.hideEditSection();
					self.alertView.showSuccessAlert('Successfully deleted affiliation: ' + affiliationName + '.');
				})
				.fail(function(jqxhr) {
					self.alertView.showDangerAlert('Unable to delete affiliation: ' + jqxhr.responseText);
				})
				.always(function() {
					$loadingIndicator.hide();
				});
		},

		saveAffiliation : function(ev) {
			var self = this;
			var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
			var $errorDiv = this.$(ERRORS_SEL);

			$loadingIndicator.show();
			$errorDiv.html('');
			var affiliationName = this.model.get('text');
			this.model.save({}, {}, this.affiliationIsCostCenter)
				.done(function() {
					self.alertView.showSuccessAlert('Successfully saved the affiliation: ' + affiliationName + '.');
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