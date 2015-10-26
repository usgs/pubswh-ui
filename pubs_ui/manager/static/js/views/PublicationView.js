/*jslint browser: true */

define([
	'handlebars',
	'bootstrap',
	'datetimepicker',
	'views/BaseView',
	'views/AlertView',
	'text!hb_templates/publication.hbs'
], function(Handlebars, bootstrap, datetimepicker, BaseView, AlertView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		template : Handlebars.compile(hbTemplate),

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$('#display-date').datetimepicker();
			this.alertView.setElement(this.$('.alert-container')).render();

		},

		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.alertView = new AlertView();

			if (this.model.has('id')) {
				this.model.fetch().done(function(jqXhr){
					self.context.model = self.model.attributes;
					self.render();
				}).fail(function(jqXHR, textStatus) {
					self.render();
					self.alertView.showAlert(self.alertView.ALERT_KINDS.danger,
						'Unable to connect with services: ' + textStatus
					);
				});
			}
			else {
				this.render();
			}
		}
	});

	return view;
});
