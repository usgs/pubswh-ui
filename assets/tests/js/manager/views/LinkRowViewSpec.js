import 'backbone.stickit';
import 'select2';

import $ from 'jquery';
import Backbone from 'backbone';

import LinkCollection from '../../../../scripts/manager/models/LinkCollection';
import LinkRowView from '../../../../scripts/manager/views/LinkRowView';


describe('LinkRowView', function() {
    var testModel, testCollection, linkTypeCollection, linkFileTypeCollection;
    var testView;

    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
        $('body').append('<div id="test-div"></div>');

        linkTypeCollection = new Backbone.Collection([
            {id : 1, text : 'Type 1'},
            {id : 2, text : 'Type 2'},
            {id : 3, text : 'Type 3'}
        ]);

        linkFileTypeCollection = new Backbone.Collection([
            {id : 1, text : 'File Type 1'},
            {id : 2, text : 'File Type 2'}
        ]);

        testCollection = new LinkCollection([
            {id : 1, rank : 1},
            {id : 2, rank : 2, type : {id : 2, text : 'Type2'}, linkFileType : {id : 1, text : 'FileType 2'}}
        ]);
        testModel = testCollection.at(1);
        spyOn(testCollection, 'updateModelRank');
        spyOn(testCollection, 'remove');

        /*
        injector.mock('backbone.stickit', stickit);
        injector.mock('views/BaseView', BaseView);
        injector.mock('hbs!hb_templates/linkRow', hbTemplate);

        injector.require(['views/LinkRowView'], function(view) {
            LinkRowView = view;
            done();
        });*/
    });

    afterEach(function() {
        testView.remove();
        $('#test-div').remove();
    });

    describe('Tests for render', function() {
        beforeEach(function () {
            testView = new LinkRowView({
                model: testModel,
                collection: testCollection,
                el: '#test-div',
                linkTypeCollection: linkTypeCollection,
                linkFileTypeCollection: linkFileTypeCollection
            });

            spyOn(testView, 'stickit');
            spyOn($.fn, 'select2').and.callThrough();
        });

        it('Expects select2\'s to be initialized', function () {
            testView.render();
            expect($.fn.select2.calls.count()).toBe(2);
            expect($.fn.select2.calls.argsFor(0)[0].data).toEqual(linkTypeCollection.toJSON());
            expect($.fn.select2.calls.argsFor(1)[0].data).toEqual(linkFileTypeCollection.toJSON());

            expect(testView.$('.link-type').val()).toEqual('2');
            expect(testView.$('.link-file-type').val()).toEqual('1');
        });
    });

    describe('Tests for event handlers', function() {
        beforeEach(function () {
            testView = new LinkRowView({
                model: testModel,
                collection: testCollection,
                el: '#test-div',
                linkTypeCollection: linkTypeCollection,
                linkFileTypeCollection: linkFileTypeCollection
            });

            spyOn(testView, 'stickit');
            testView.render();
        });

        it('Expect select2 event handlers to update the model', function() {
            var ev = {
                currentTarget : {
                    value : 1,
                    selectedOptions : [{innerHTML : 'Type 1'}]
                }
            };

            testView.selectLinkType(ev);
            expect(testModel.get('type')).toEqual({id : 1, text : 'Type 1'});

            testView.resetLinkType();
            expect(testModel.get('type')).not.toBeDefined();

            ev = {
                currentTarget : {
                    value : 2,
                    selectedOptions : [{innerHTML : 'File Type 2'}]
                }
            };
            testView.selectLinkFileType(ev);
            expect(testModel.get('linkFileType')).toEqual({id : 2, text : 'File Type 2'});

            testView.resetLinkFileType();
            expect(testModel.get('linkFileType')).not.toBeDefined();
        });

        it('Expects that when deleteRow is called, the model is removed from the collection', function() {
            testView.deleteRow();
            expect(testCollection.remove).toHaveBeenCalledWith(testModel);
        });

        it('Expects when updateLinksOrder is called, the collection updates the models\' ranks', function() {
            var ev = {};
            testView.updateLinksOrder(ev, 1);
            expect(testCollection.updateModelRank.calls.argsFor(0)[0]).toBe(testModel);
            expect(testCollection.updateModelRank.calls.argsFor(0)[1]).toBe(2);
        });
    });

    describe('Tests for model event listeners', function() {
        beforeEach(function () {
            spyOn($.fn, 'select2').and.callThrough();
            testView = new LinkRowView({
                model: testModel,
                collection: testCollection,
                el: '#test-div',
                linkTypeCollection: linkTypeCollection,
                linkFileTypeCollection: linkFileTypeCollection
            });

            testView.render();
        });

        it('Expects that if type is updated, the type DOM element is updated', function() {
            var $select = testView.$('.link-type');
            testModel.set('type', {id : 1, type : 'Type 1'});
            expect($select.val()).toEqual('1');

            testModel.unset('type');
            expect($select.val()).toBeNull();
        });

        it('Expects that if the link file type is updated, the DOM element is updated', function() {
            var $select = testView.$('.link-file-type');
            testModel.set('linkFileType', {id : 2, type : 'File Type 2'});
            expect($select.val()).toEqual('2');

            testModel.unset('linkFileType');
            expect($select.val()).toBeNull();
        });
    });
});
