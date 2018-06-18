define([
    'squire',
    'jquery'
], function(Squire, $) {
    'use strict';
    describe('AlertView', function() {
        var AlertView;
        var testView;
        var $testDiv;
        var injector;

        beforeEach(function(done) {
            $('body').append('<div id="test-div"><div>');
            $testDiv = $('#test-div');
            injector = new Squire();

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
            injector.remove();
            testView.remove();
            $testDiv.remove();
        });

        it('Expects initialize to set the context variables to null strings', function() {
            expect(testView.context).toEqual({
                alertKind : '',
                message : ''
            });
        });

        it('Expects show*Alert to render the appropriate alert', function() {
            var $alert, $message;
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

        it('Expects closeAlert to remove the rendered alert if any', function() {
            testView.showSuccessAlert('Success alert');
            expect($testDiv.find('.alert').length).not.toBe(0);

            testView.closeAlert();
            expect($testDiv.find('.alert').length).toBe(0);

            testView.closeAlert();
            expect($testDiv.find('.alert').length).toBe(0);
        });
    });
});
