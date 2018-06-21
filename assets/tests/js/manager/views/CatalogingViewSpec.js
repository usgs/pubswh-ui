import $ from 'jquery';

import CatalogingView from '../../../../scripts/manager/views/CatalogingView';
import PublicationModel from '../../../../scripts/manager/models/PublicationModel';


describe('CatalogingView', function() {
    var testView;
    var testModel;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');

        testModel = new PublicationModel();
        testView = new CatalogingView({
            el : '#test-div',
            model : testModel
        });
    });

    afterEach(function() {
        testView.remove();
        $('#test-div').remove();
    });

    describe('Tests for render', function() {

        beforeEach(function() {
            spyOn($.fn, 'datetimepicker');
            spyOn(testView, 'stickit');
            testView.render();
        });


        it('Expects the datetimepickers to be initialized', function() {
            expect($.fn.datetimepicker.calls.count()).toBe(2);
            expect($.fn.datetimepicker.calls.argsFor(0)[0].format).toEqual('YYYY-MM-DD');
            expect($.fn.datetimepicker.calls.argsFor(1)[0].format).toEqual('YYYY-MM-DD');
        });

        it('Expects backbone stickit to be initialized', function() {
            expect(testView.stickit).toHaveBeenCalled();
        });
    });

    describe('Tests for DOM event handlers', function() {
        beforeEach(function() {
            testView.render();
        });

        it('Expects text fields to update their model fields', function() {
            testView.$('#prod-desc-input').val('Description').trigger('change');
            expect(testModel.get('productDescription')).toEqual('Description');
            testView.$('#volume-input').val('Volume').trigger('change');
            expect(testModel.get('volume')).toEqual('Volume');
            testView.$('#issue-input').val('Issue').trigger('change');
            expect(testModel.get('issue')).toEqual('Issue');
            testView.$('#edition-input').val('Edition').trigger('change');
            expect(testModel.get('edition')).toEqual('Edition');
            testView.$('#start-page-input').val('1').trigger('change');
            expect(testModel.get('startPage')).toEqual('1');
            testView.$('#end-page-input').val('3').trigger('change');
            expect(testModel.get('endPage')).toEqual('3');
            testView.$('#num-pages-input').val('2').trigger('change');
            expect(testModel.get('numberOfPages')).toEqual('2');
            testView.$('#notes-input').val('Notes').trigger('change');
            expect(testModel.get('notes')).toEqual('Notes');
            testView.$('#scale-input').val('Scale').trigger('change');
            expect(testModel.get('scale')).toEqual('Scale');
            testView.$('#projection-input').val('Projection').trigger('change');
            expect(testModel.get('projection')).toEqual('Projection');
            testView.$('#datum-input').val('Datum').trigger('change');
            expect(testModel.get('datum')).toEqual('Datum');
            testView.$('#comment-input').val('Comments').trigger('change');
            expect(testModel.get('publicComments')).toEqual('Comments');
        });

        it('Expects the checkbox fields to change their model fields', function() {
            testView.$('#online-only-input').prop('checked', true).trigger('change');
            expect(testModel.get('onlineOnly')).toEqual('Y');
            testView.$('#online-only-input').prop('checked', false).trigger('change');
            expect(testModel.get('onlineOnly')).toEqual('N');

            testView.$('#additional-files-input').prop('checked', true).trigger('change');
            expect(testModel.get('additionalOnlineFiles')).toEqual('Y');
            testView.$('#additional-files-input').prop('checked', false).trigger('change');
            expect(testModel.get('additionalOnlineFiles')).toEqual('N');
        });

        it('Expects the datetime fields to update their model fields', function() {
            testView.$('#temporal-start-input').val('2000-12-11').trigger('change');
            expect(testModel.get('temporalStart')).toEqual('2000-12-11');
            testView.$('#temporal-start-input').val('').trigger('change');
            expect(testModel.get('temporalStart')).toBeUndefined();
            testView.$('#temporal-end-input').val('2000-12-11').trigger('change');
            expect(testModel.get('temporalEnd')).toEqual('2000-12-11');
            testView.$('#temporal-end-input').val('').trigger('change');
            expect(testModel.get('temporalEnd')).toBeUndefined();
        });
    });

    describe('Tests for model event handlers', function() {
        beforeEach(function() {
            testView.render();
        });

        it('Expects that changes to model properties representing text fields updates the text field', function() {
            testModel.set('productDescription', 'Description');
            expect(testView.$('#prod-desc-input').val()).toEqual('Description');
            testModel.set('volume', 'Volumne');
            expect(testView.$('#volume-input').val()).toEqual('Volumne');
            testModel.set('issue', 'Issue');
            expect(testView.$('#issue-input').val()).toEqual('Issue');
            testModel.set('edition', 'Edition');
            expect(testView.$('#edition-input').val()).toEqual('Edition');
            testModel.set('startPage', '1');
            expect(testView.$('#start-page-input').val()).toEqual('1');
            testModel.set('endPage', '3');
            expect(testView.$('#end-page-input').val()).toEqual('3');
            testModel.set('numberOfPages', '2');
            expect(testView.$('#num-pages-input').val()).toEqual('2');
            testModel.set('notes', 'Notes');
            expect(testView.$('#notes-input').val()).toEqual('Notes');
            testModel.set('scale', 'Scale');
            expect(testView.$('#scale-input').val()).toEqual('Scale');
            testModel.set('projection', 'Projection');
            expect(testView.$('#projection-input').val()).toEqual('Projection');
            testModel.set('datum', 'Datum');
            expect(testView.$('#datum-input').val()).toEqual('Datum');
            testModel.set('publicComments', 'Comments');
            expect(testView.$('#comment-input').val()).toEqual('Comments');
        });

        it('Expects change to model properties representing check box inputs update the inputs', function() {
            testModel.set('onlineOnly', 'Y');
            expect(testView.$('#online-only-input').is(':checked')).toBe(true);
            testModel.set('onlineOnly', 'N');
            expect(testView.$('#online-only-input').is(':checked')).toBe(false);
            testModel.set('additionalOnlineFiles', 'Y');
            expect(testView.$('#additional-files-input').is(':checked')).toBe(true);
            testModel.set('additionalOnlineFiles', 'N');
            expect(testView.$('#additional-files-input').is(':checked')).toBe(false);
        });

        it('Expects change to model properties representing datetime pickers, updates those inputs', function() {
            testModel.set('temporalStart', '2000-12-11');
            expect(testView.$('#temporal-start-input').val()).toEqual('2000-12-11');
            testModel.unset('temporalStart');
            expect(testView.$('#temporal-start-input').val()).toEqual('');
            testModel.set('temporalEnd', '2000-12-11');
            expect(testView.$('#temporal-end-input').val()).toEqual('2000-12-11');
            testModel.unset('temporalEnd');
            expect(testView.$('#temporal-end-input').val()).toEqual('');
        });
    });
});
