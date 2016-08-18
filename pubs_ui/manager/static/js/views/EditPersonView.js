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
	 * 		@prop {PersonModel} model
	 */
	var view = BaseView.extend({
		template : hbTemplate,

		events : {
			'select2:select .outside-affiliation-select' : 'selectOutsideAffiliation',
			'select2:unselect .outside-affiliation-select' : 'unselectOutsideAffliliation',
			'select2:select .usgs-affiliation-select' : 'selectUsgsAffiliation',
			'select2:unselect .usgs-affiliation-select' : 'unselectUsgsAffiliation'
		},

		bindings : {
			'#first-name' : 'given',
			'#last-name' : 'family',
			'#suffix' : 'suffix',
			'#email' : 'email',
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
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			this.stickit();

			this.outsideAffiliatesPromise.done(function() {
				this.$('.outside-affliliation-select').select2(_.extend({
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
				this.$('.outside-affliliation-select').select2(_.extend({
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

		}


	});

	return view;
})
