/* jslint browser:true */

define([
	'backbone.stickit',
	'views/BaseView',
	'models/AffiliationModel',
	'hbs!hb_templates/manageAffiliations'
], function(stickit, BaseView, AffiliationModel, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'click .save-affiliation-btn' : 'saveAffiliation'
		},

		bindings : {
			'#cost-center-input' : 'costCenter',
			'#affiliation-input' : 'affiliationName',
			'#affiliation-active-input' : 'active'
		},

		initialize : function(options) {
			this.render();
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
			this.stickit();
		},

		saveAffiliation : function() {
			var isNew = this.model.isNew();
			console.log(this.model);
			this.model.save();
		}
	});
	return view;
})