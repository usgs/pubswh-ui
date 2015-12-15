/* jslint browser: true */
define([
	'squire',
	'jquery'
], function(Squire, $) {
	"use strict";
	describe('AlertView', function() {
		var AlertView;
		var testView;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"><div>');
			var injector = new Squire();

			injector.mock('text!hb_templates/alert.hbs',
				'<div class="alert {{alertKind}}"><div class="alert-message">{{message}}</div></div>'
			);

			injector.require(['views/AlertView'], function(view) {
				AlertView = view;
				testView = new AlertView({
					el : '#test-div'
				});
				done();
			});
		});

		afterEach(function() {
			testView.remove();
			$('#test-div').remove();
		});

		it('Expects initialize to set the context variables to null strings', function() {
			expect(testView.context).toEqual({
				alertKind : '',
				message : ''
			});
		});

		it('Expects show*Alert to render the appropriate alert', function() {
			var $alert, $message
			testView.showSuccessAlert('Success alert');
			$alert = testView.$('.alert');
			$message = testView.$('.alert-message');
			expect($alert.hasClass('alert-success')).toBe(true);
			expect($message.html()).toEqual('Success alert');

			testView.showInfoAlert('Info alert');
			expect($alert.hasClass('alert-success')).toBe(false);
			expect($alert.hasClass('alert-info')).toBe(true);
			expect($message.html()).toEqual('Info alert');

			testView.showWarningAlert('Warning alert');
			expect($alert.hasClass('alert-info')).toBe(false);
			expect($alert.hasClass('alert-warning')).toBe(true);
			expect($message.html()).toEqual('Warning alert');

			testView.showDangerAlert('Danger alert');
			expect($alert.hasClass('alert-warning')).toBe(false);
			expect($alert.hasClass('alert-danger')).toBe(true);
			expect($message.html()).toEqual('Danger alert');
		});
	});
});