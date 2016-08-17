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

		bindings: {
			'#cost-center-input' : 'costCenter',
			'#affiliation-input' : 'outsideAffiliation'
		},

		initialize : function(options) {
			this.render();
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
			this.stickit();
		}
	});
	return view;
})