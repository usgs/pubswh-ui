import Squire from 'squire';
import $ from 'jquery';
import _ from 'underscore';
import * as bootstrap from 'bootstrap';
import module from 'module';

import BaseView from '../../../../scripts/manager/views/BaseView';
import hbTemplate from '../../../../scripts/manager/hb_templates/loginDialog.hbs';


describe('LoginDialogView', function() {
    var LoginDialogView, testView;
    var injector;

    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
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
            spyOn($, 'ajax');
        });

        it('Expects that an ajax call is with the login dialog form data when the submit button is clicked', function() {
            var args;

            testView.show();
            testView.$('#username-input').val('testname');
            testView.$('#password-input').val('testpassword');
            testView.$('.submit-btn').trigger('click');


            expect($.ajax).toHaveBeenCalled();
            args = $.ajax.calls.argsFor(0)[0];
            expect(args.url).toContain('loginservice');
            expect(args.method).toEqual('POST');
            expect(args.data).toContain('username=testname');
            expect(args.data).toContain('password=testpassword');
        });

        it('Expects that a successful ajax call when the submit button is clicked closes the dialog and clears the text fields', function() {
            var $username = testView.$('#username-input');
            var $password = testView.$('#password-input');
            var successCallback;
            testView.show();

            spyOn($.fn, 'modal').and.callThrough();

            $username.val('testname');
            $password.val('testpassword');
            testView.$('.submit-btn').trigger('click');

            successCallback = $.ajax.calls.argsFor(0)[0].success;
            successCallback(); // Simulates a successful ajax call

            expect($.fn.modal).toHaveBeenCalled();
            expect($.fn.modal.calls.argsFor(0)[0]).toEqual('hide');
            expect($username.val()).toEqual('');
            expect($password.val()).toEqual('');
        });

        it('Expects that a successful ajax call when the submit button is clicked calls the function passed in the show for the view', function() {
            var verifySpy = jasmine.createSpy('verifySpy');
            var successCallback;
            testView.show(verifySpy);

            testView.$('#username-input').val('testname');
            testView.$('#password-input').val('testpassword');
            testView.$('.submit-btn').trigger('click');

            successCallback = $.ajax.calls.argsFor(0)[0].success;
            successCallback(); // Simulates a successful ajax call

            expect(verifySpy).toHaveBeenCalled();
        });

        it('Expects that a failed ajax call when the submit button is clicked shows the errors and does not call the verify function', function() {
            var verifySpy = jasmine.createSpy('verifySpy');
            var errorCallback;
            testView.show(verifySpy);

            spyOn($.fn, 'modal').and.callThrough();

            testView.$('#username-input').val('testname');
            testView.$('#password-input').val('testpassword');
            testView.$('.submit-btn').trigger('click');

            errorCallback = $.ajax.calls.argsFor(0)[0].error;
            errorCallback({}, 'Internal server error', '');

            expect($.fn.modal).not.toHaveBeenCalled();
            expect(verifySpy).not.toHaveBeenCalled();
            expect(testView.$('.login-errors').html()).not.toEqual('');
        });

        it('Expects that a submit event will also trigger the logout function', function() {
            var $username = testView.$('#username-input');
            var $password = testView.$('#password-input');
            var successCallback;

            testView.show();

            spyOn($.fn, 'modal').and.callThrough();

            $username.val('testname');
            $password.val('testpassword');
            testView.$('form').trigger('submit');

            successCallback = $.ajax.calls.argsFor(0)[0].success;
            successCallback(); // Simulates a successful ajax call

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
            expect($.ajax).not.toHaveBeenCalled();
            expect($.fn.modal).toHaveBeenCalled();
            expect($.fn.modal.calls.argsFor(0)[0]).toEqual('hide');
        });
    });
});
