import Backbone from 'backbone';
import Squire from 'squire';
import $ from 'jquery';

import PublicationModel from '../../../../scripts/manager/models/PublicationModel';
import LookupModel from '../../../../scripts/manager/models/LookupModel';


describe('SPNView', function() {
    var SPNView, testView;
    var testModel;
    var serviceCenterFetchDeferred;
    var serviceCenterFetchSpy;
    var injector;

    beforeEach(function(done) {

        $('body').append('<div id="test-div"></div>');

        testModel = new PublicationModel();

        serviceCenterFetchDeferred = $.Deferred();

        serviceCenterFetchSpy = jasmine.createSpy('serviceCenterFetchSpy').and.returnValue(serviceCenterFetchDeferred.promise());

        spyOn(window, 'setInterval');// So the tinymce does not get initialized

        injector = new Squire();
        injector.mock('jquery', $); // So we can spy on select2 and datetimepicker functions
        injector.mock('models/PublishingServiceCenterCollection', Backbone.Collection.extend({
            model : LookupModel,
            url: '/test/lookup',
            fetch : serviceCenterFetchSpy
        }));
        injector.require(['views/SPNView'], function(view) {
            SPNView = view;
            done();
        });
    });

    afterEach(function() {
        injector.remove();
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that the service center collection is fetched at initialization', function() {
        testView = new SPNView({
            el : '#test-div',
            model : testModel
        });
        expect(serviceCenterFetchSpy).toHaveBeenCalled();
    });

    describe('Tests for render', function() {
        beforeEach(function() {
            testView = new SPNView({
                el : '#test-div',
                model : testModel
            });
            spyOn($.fn, 'datetimepicker');
            spyOn($.fn, 'select2');
            spyOn(testView, 'stickit');
        });

        it('Expects the two date time pickers to be initialized, both as date only pickers', function() {
            testView.render();
            expect($.fn.datetimepicker.calls.count()).toBe(2);
            expect($.fn.datetimepicker.calls.argsFor(0)[0].format).toEqual('YYYY-MM-DD');
            expect($.fn.datetimepicker.calls.argsFor(1)[0].format).toEqual('YYYY-MM-DD');
        });

        it('Expects that stickit is initialized', function() {
            testView.render();
            expect(testView.stickit).toHaveBeenCalled();
        });

        it('Expects the dynamic select2\'s to be initialized', function() {
            testView.render();
            expect($.fn.select2.calls.count()).toBe(2);
            expect($.fn.select2.calls.argsFor(0)[0].ajax.url).toMatch('publications');
            expect($.fn.select2.calls.argsFor(1)[0].ajax.url).toMatch('publications');
        });

        it('Expects the PSC select2 to be initialized after the service center collections has been fetched', function() {
            var select2Count;
            var serviceCenterData = [{id : 1, text : 'Text1'}, {id : 2, text : 'Text2'}];
            testView.render();
            select2Count = $.fn.select2.calls.count();
            testView.serviceCenterCollection.set(serviceCenterData);
            serviceCenterFetchDeferred.resolve();

            expect($.fn.select2.calls.count()).toBe(select2Count + 1);
            expect($.fn.select2.calls.argsFor(select2Count)[0].data).toEqual(serviceCenterData);
        });
    });

    describe('Tests for DOM event handlers', function() {
        beforeEach(function() {
            testView = new SPNView({
                el : '#test-div',
                model : testModel
            });
            testView.render();
        });

        it('Expects the publishedDate property in the model to update when the DOM input is updated', function() {
            var $input = testView.$('#published-date-input');
            $input.val('2001-04-15').trigger('change');
            expect(testModel.get('publishedDate')).toEqual('2001-04-15');
            $input.val('').trigger('change');
            expect(testModel.get('publishedDate')).toBeUndefined();
        });

        it('Expects the revisedDate property in the model to update when the DOM input is updated', function() {
            var $input = testView.$('#revised-date-input');
            $input.val('2001-04-15').trigger('change');
            expect(testModel.get('revisedDate')).toEqual('2001-04-15');
            $input.val('').trigger('change');
            expect(testModel.get('revisedDate')).toBeUndefined();
        });

        it('Expects the isPartOf property in the model to update when the DOM input is updated', function() {
            var ev = {
                currentTarget : {
                    value : 11,
                    selectedOptions : [{innerHTML :  'Text11'}]
                }
            };
            testView.selectIsPartOf(ev);
            expect(testModel.get('isPartOf')).toEqual({id : 11, text : 'Text11'});

            testView.resetIsPartOf();
            expect(testModel.get('isPartOf')).toBeUndefined();
        });

        it('Expects the supersededBy property in the model to update when the DOM input is updated', function() {
            var ev = {
                currentTarget : {
                    value : 11,
                    selectedOptions : [{innerHTML :  'Text11'}]
                }
            };
            testView.selectSupersededBy(ev);
            expect(testModel.get('supersededBy')).toEqual({id : 11, text : 'Text11'});

            testView.resetSupersededBy();
            expect(testModel.get('supersededBy')).toBeUndefined();
        });

        it('Expects the publishingServiceCenter in the model to update when the DOM input is updated', function() {
            var ev = {
                currentTarget : {
                    value : 11,
                    selectedOptions : [{innerHTML :  'Text11'}]
                }
            };
            testView.selectPSC(ev);
            expect(testModel.get('publishingServiceCenter')).toEqual({id : 11, text : 'Text11'});

            testView.resetPSC();
            expect(testModel.get('publishingServiceCenter')).toBeUndefined();
        });
    });

    describe('Tests for model event handlers', function() {
        beforeEach(function() {
            testView = new SPNView({
                el : '#test-div',
                model : testModel
            });
            testView.render();
            testView.serviceCenterCollection.set([{id : 1, text : 'Text1'}, {id : 2, text : 'Text2'}]);
            serviceCenterFetchDeferred.resolve();
        });

        it('Expects the published date input to reflect changes in the publishedDate model property', function() {
            var $input = testView.$('#published-date-input');
            testModel.set('publishedDate', '2002-03-30');
            expect($input.val()).toEqual('2002-03-30');

            testModel.unset('publishedDate');
            expect($input.val()).toEqual('');
        });

        it('Expects the revised date input to reflect changes in the revisedDate model property', function() {
            var $input = testView.$('#revised-date-input');
            testModel.set('revisedDate', '2002-03-30');
            expect($input.val()).toEqual('2002-03-30');

            testModel.unset('revisedDate');
            expect($input.val()).toEqual('');
        });

        it('Expects the Is Part Of input to reflect changes in the isPartOf model property', function() {
            var $input = testView.$('#is-part-of-input');
            testModel.set('isPartOf', {id : 11, text : 'Text11'});
            expect($input.val()).toEqual('11');

            testModel.unset('isPartOf');
            expect($input.val()).toBeNull();
        });

        it('Expects the is superseded input to reflect changes in the supersededBy model property', function() {
            var $input = testView.$('#superseded-by-input');
            testModel.set('supersededBy', {id : 2, text : 'Text2'});
            expect($input.val()).toEqual('2');

            testModel.unset('supersededBy');
            expect($input.val()).toBeNull();
        });

        it('Expects the PSC input to reflect changes in the publishingServiceCenter property', function() {
            var $input = testView.$('#psc-input');
            testModel.set('publishingServiceCenter', {id : 2, text : 'Text2'});
            expect($input.val()).toEqual('2');

            testModel.unset('publishingServiceCenter');
            expect($input.val()).toBeNull();
        });
    });
});
