/* jslint browser: true */

define([
	'jquery',
	'underscore',
	'bootstrap',
	'module',
	'views/BaseView',
	'hbs!hb_templates/loginDialog'
], function($, _, bootstrap, module, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template : hbTemplate,

		events : {
			'click .submit-btn' : 'verifyCredentials',
			'submit form' : 'verifyCredentials',
			'click .cancel-btn' : 'close'
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$('.modal').modal({
				show : false
			});
		},

		/*
		 * Show the login dialog.
		 * @param {Function} loginFnc (optional) - A parameterless function which will be executed when a user tries to log in.
		 */
		show : function(loginFnc) {
			if (_.isFunction(loginFnc)) {
				this.loginFnc = loginFnc;
			}
			this.$('.modal').modal('show');
		},

		verifyCredentials : function(ev) {
			var self = this;
			var data = this.$('form').serialize();

			ev.preventDefault();

			$.ajax({
				url : module.config().scriptRoot + '/loginservice/',
				method : 'POST',
				data : data,
				success : function() {
					if (_.has(self, 'loginFnc')) {
						self.loginFnc();
					}
					self.close()
				},
				error : function(jqXHR, textStatus, error) {
					self.$('.login-errors').html('Unable to log in with error: ' + textStatus +
						'<br/>Please try again');
				}
			});
		},

		close : function(ev) {
			this.$('.modal').modal('hide');
			this.$('.login-errors').html('');
			this.$('input').val('');

			_.omit(this, 'loginFnc');
		}
	});

	return view;
});