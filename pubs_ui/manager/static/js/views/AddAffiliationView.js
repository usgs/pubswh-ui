/* jslint browser:true */

define([
	'jquery',
	'backbone.stickit',
	'views/BaseView',
	'models/AffiliationModel',
	'hbs!hb_templates/manageAffiliations'
], function($, stickit, BaseView, AffiliationModel, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		template : hbTemplate,

		events : {
			'click .save-affiliation-btn' : 'saveAffiliation'
		},

		bindings : {
			'#usgs-checkbox-input' : 'usgs',
			'#affiliation-input' : 'text',
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