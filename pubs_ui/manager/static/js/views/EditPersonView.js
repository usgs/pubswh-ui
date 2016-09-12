/* jslint browser: true */
/* global define */

define([
	'underscore',
	'jquery',
	'backbone.stickit',
	'select2',
	'models/CostCenterCollection',
	'models/OutsideAffiliationLookupCollection',
	'views/BaseView',
	'hbs!hb_templates/editPerson'
], function(_, $, stickit, $select2, CostCenterCollection, OutsideAffiliationLookupCollection, BaseView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		allowClear : true,
		theme : 'bootstrap'
	};

	/*
	 * @constructs
	 * @param {Object} options
	 * 		@prop {Jquery selector} el
	 * 		@prop {ContributorModel} model
	 */
	var view = BaseView.extend({
		template : hbTemplate,

		events : {
			'select2:select .affiliation-select-div select' : 'selectAffiliation',
			'select2:unselect .affiliation-select-div select' : 'unselectAffiliation',
		},

		bindings : {
			'#first-name' : 'given',
			'#last-name' : 'family',
			'#suffix' : 'suffix',
			'#email' : 'email',
			'#orcid-id' : 'orcid',
			'#is-usgs' : 'usgs'
		},

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.activeCostCenters = new CostCenterCollection();
			this.notActiveCostCenters = new CostCenterCollection();
			this.costCenterPromise = $.when(
					this.activeCostCenters.fetch({data : {active : 'y'}}),
					this.notActiveCostCenters.fetch({data : {active : 'n'}})
			);

			this.activeOutsideAffiliates = new OutsideAffiliationLookupCollection();
			this.notActiveOutsideAffiliates = new OutsideAffiliationLookupCollection();
			this.outsideAffiliatesPromise = $.when(
				this.activeOutsideAffiliates.fetch({data : {active : 'y'}}),
				this.notActiveOutsideAffiliates.fetch({data : {active : 'n'}})
			);

			// Add binding to dom for select2
			this.listenTo(this.model, 'change:affiliation', this.updateAffiliation);
			this.listenTo(this.model, 'change:usgs', this.toggleAffiliationVisibility);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			this.stickit();

			this.toggleAffiliationVisibility();
			this.outsideAffiliatesPromise.done(function() {
				self.$('.outside-affiliation-select').select2(_.extend({
					data: [{
						text: 'Active',
						children: self.activeOutsideAffiliates.toJSON()
					}, {
						text: 'Not Active',
						children: self.notActiveOutsideAffiliates.toJSON()
					}]
				}, DEFAULT_SELECT2_OPTIONS));
			});
			this.costCenterPromise.done(function() {
				self.$('.usgs-affiliation-select').select2(_.extend({
					data: [{
						text: 'Active',
						children: self.activeCostCenters.toJSON()
					}, {
						text: 'Not Active',
						children: self.notActiveCostCenters.toJSON()
					}]
				}, DEFAULT_SELECT2_OPTIONS));
			});
			$.when(this.outsideAffiliatesPromise, this.costCenterPromise).done(function() {
				self.updateAffiliation();
			});

			return this;
		},

		/*
		 * Model event handlers
		 */

		updateAffiliation : function() {
			var $select = (this.model.has('usgs') && this.model.get('usgs')) ? this.$('.usgs-affiliation-select') : this.$('.outside-affiliation-select');
			var newVal = this.model.has('affiliation') ? this.model.get('affiliation').id : '';
			$select.val(newVal).trigger('change');
		},

		toggleAffiliationVisibility : function() {
			var usgs = this.model.has('usgs') && this.model.get('usgs');
			var $outsideSelectDiv = this.$('.outside-affiliation-div');
			var $costCenterSelectDiv = this.$('.usgs-affiliation-div');

			if (usgs) {
				$outsideSelectDiv.hide();
				$costCenterSelectDiv.show();
				$costCenterSelectDiv.find('select').val('').trigger('change');
			}
			else {
				$outsideSelectDiv.show();
				$costCenterSelectDiv.hide();
				$outsideSelectDiv.find('select').val('').trigger('change');
			}
		},

		/*
		 * DOM event handlers
		 */

		selectAffiliation : function(ev) {
			this.model.set('affiliation', {
				id : ev.currentTarget.value,
				text : ev.currentTarget.selectedOptions[0].innerHTML
			});
		},

		unselectAffiliation : function() {
			this.model.unset('affiliation');
		}


	});

	return view;
});
