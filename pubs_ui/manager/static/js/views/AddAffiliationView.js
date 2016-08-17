/* jslint browser:true */

define([
	'views/BaseView',
	'models/AffiliationModel',
	'hbs!hb_templates/manageAffiliations'
], function(BaseView, AffiliationModel, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		template : hbTemplate,

		initialize : function(options) {
			console.log(this.model);
			this.render();
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(self, arguments);
		}
	});
	return view;
})