/* jslint browser: true */

define([
	'handlebars',
	'bootstrap',
	'views/BaseView',
	'text!hb_templates/confirmationDialog.hbs'
], function(Handlebars, bootstrap, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template : Handlebars.compile(hbTemplate),

		events : {
			'click .confirm-btn' : 'confirmAction',
			'click .cancel-btn' : 'close'
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$('.modal').modal({
				show : false
			});
		},

		show : function(message, actionFnc) {
			this.actionFnc = actionFnc;
			this.$('.modal-body').html(message);
			this.$('.modal').modal('show')
		},

		close : function() {
			this.$('.modal').modal('hide');
			_.omit(this, 'actionFnc');
		},

		confirmAction : function() {
			if (_.has(this, 'actionFnc')) {
				this.actionFnc();
			}
			this.close();
		}
	});

	return view;
});
