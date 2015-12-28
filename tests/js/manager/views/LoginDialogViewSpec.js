/* jslint browser: true */

define([
	'squire',
	'sinon',
	'jquery',
	'underscore',
	'bootstrap',
	'module',
	'views/BaseView',
	'hbs!hb_templates/loginDialog'
], function(Squire, sinon, $, _, bootstrap, module, BaseView, hbTemplate) {
	"use strict";
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

	describe('LoginDialogView', function() {
		var LoginDialogView, testView;
		var server;
		var injector;

		beforeEach(function(done) {
			injector = new Squire();
			$('body').append('<div id="test-div"></div>');

			injector.mock('jquery', $);
			injector.mock('underscore', _);
			injector.mock('bootstrap', bootstrap);
			injector.mock('module', module);
			injector.mock('views/BaseView', BaseView);
			injector.mock('hbs!hb_templates/loginDialog', hbTemplate);
			injector.require(['views/LoginDialogView'], function(view) {
				LoginDialogView = view;
				testView = new LoginDialogView({
					el: '#test-div'
				});
				done();
			});
		});

		afterEach(function() {
			injector.remove();
			testView.remove();
			$('#test-div').remove();
		});

		it('Expects render to but the dialog in the DOM but it will not be shown', function() {
			spyOn($.fn, 'modal').and.callThrough();
			testView.render();

			expect($('.modal').length).toBe(1);
			expect($.fn.modal).toHaveBeenCalled();
			expect($.fn.modal.calls.argsFor(0)[0].show).toBe(false);
		});

		describe('Tests for show', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects the modal to be visible', function() {
				spyOn($.fn, 'modal').and.callThrough();
				testView.show();
				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.argsFor(0)[0]).toEqual('show');
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				testView.render();
				server = sinon.fakeServer.create();
			});

			afterEach(function() {
				server.restore();
			});

			it('Expects that an ajax call is with the login dialog form data when the submit button is clicked', function() {
				testView.show();
				testView.$('#username-input').val('testname');
				testView.$('#password-input').val('testpassword');
				testView.$('.submit-btn').trigger('click');
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toContain('loginservice');
				expect(server.requests[0].method).toEqual('POST');
				expect(server.requests[0].requestBody).toContain('username=testname');
				expect(server.requests[0].requestBody).toContain('password=testpassword');
			});

			it('Expects that a successful ajax call when the submit button is clicked closes the dialog and clears the text fields', function() {
				var $username = testView.$('#username-input');
				var $password = testView.$('#password-input');
				testView.show();

				spyOn($.fn, 'modal').and.callThrough();

				$username.val('testname');
				$password.val('testpassword');
				testView.$('.submit-btn').trigger('click');

				server.respondWith([200, {"Content-Type" : 'application/json'}, '{}']);
				server.respond();
				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.argsFor(0)[0]).toEqual('hide');
				expect($username.val()).toEqual('');
				expect($password.val()).toEqual('');
			});

			it('Expects that a successful ajax call when the submit button is clicked calls the function passed in the show for the view', function() {
				var verifySpy = jasmine.createSpy('verifySpy');
				testView.show(verifySpy);

				testView.$('#username-input').val('testname');
				testView.$('#password-input').val('testpassword');
				testView.$('.submit-btn').trigger('click');

				server.respondWith([200, {"Content-Type" : 'application/json'}, '{}']);
				server.respond();

				expect(verifySpy).toHaveBeenCalled();
			});

			it('Expects that a failed ajax call when the submit button is clicked shows the errors and does not call the verify function', function() {
				var verifySpy = jasmine.createSpy('verifySpy');
				testView.show(verifySpy);

				spyOn($.fn, 'modal').and.callThrough();

				testView.$('#username-input').val('testname');
				testView.$('#password-input').val('testpassword');
				testView.$('.submit-btn').trigger('click');

				server.respondWith([500, {}, 'Internal server error']);
				server.respond();

				expect($.fn.modal).not.toHaveBeenCalled();
				expect(verifySpy).not.toHaveBeenCalled();
				expect(testView.$('.login-errors').html()).not.toEqual('');
			});

			it('Expects that a submit event will also trigger the logout function', function() {
				var $username = testView.$('#username-input');
				var $password = testView.$('#password-input');
				testView.show();

				spyOn($.fn, 'modal').and.callThrough();

				$username.val('testname');
				$password.val('testpassword');
				testView.$('form').trigger('submit');

				server.respondWith([200, {"Content-Type" : 'application/json'}, '{}']);
				server.respond();
				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.argsFor(0)[0]).toEqual('hide');
				expect($username.val()).toEqual('');
				expect($password.val()).toEqual('');
			});

			it('Expects that clicking the cancel btn closes the dialog without making the ajax call', function() {
				var $username = testView.$('#username-input');
				var $password = testView.$('#password-input');
				testView.show();

				spyOn($.fn, 'modal').and.callThrough();

				$username.val('testname');
				$password.val('testpassword');

				testView.$('.cancel-btn').trigger('click');
				expect(server.requests.length).toBe(0);
				expect($.fn.modal).toHaveBeenCalled();
				expect($.fn.modal.calls.argsFor(0)[0]).toEqual('hide');
			});
		});
	});


})

