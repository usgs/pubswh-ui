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
			console.log(this.fetchPromise);
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