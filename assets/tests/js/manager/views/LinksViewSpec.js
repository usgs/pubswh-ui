import $ from 'jquery';

import LinkCollection from '../../../../scripts/manager/models/LinkCollection';
import LinkFileTypeCollection from '../../../../scripts/manager/models/LinkFileTypeCollection';
import LinkRowView from '../../../../scripts/manager/views/LinkRowView';
import LinkTypeCollection from '../../../../scripts/manager/models/LinkTypeCollection';
import LinksView from '../../../../scripts/manager/views/LinksView';


describe('LinksView', function() {

    var testView;
    var testCollection;
    var fetchDeferred, linkTypeDeferred, linkFileTypeDeferred;
    var renderLinkRowViewSpy;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');

        fetchDeferred = $.Deferred();
        linkTypeDeferred = $.Deferred();
        linkFileTypeDeferred = $.Deferred();

        testCollection = new LinkCollection([
            {id : 1, rank : 1},
            {id : 2, rank : 2},
            {id : 3, rank : 3}
        ]);
        spyOn(testCollection, 'fetch').and.returnValue(fetchDeferred.promise);

        renderLinkRowViewSpy = jasmine.createSpy('renderLinkRowViewSpy');

        spyOn(LinkTypeCollection.prototype, 'fetch').and.returnValue(linkTypeDeferred.promise());
        spyOn(LinkFileTypeCollection.prototype, 'fetch').and.returnValue(linkFileTypeDeferred.promise());
        spyOn(LinkRowView.prototype, 'setElement').and.returnValue({
            render : renderLinkRowViewSpy
        });
        spyOn(LinkRowView.prototype, 'render').and.callFake(renderLinkRowViewSpy);
        spyOn(LinkRowView.prototype, 'remove');
        LinkRowView.prototype.$el = {
            appendTo : jasmine.createSpy('appendToSpy')
        };
    });

    afterEach(function() {
        LinkRowView.prototype.$el = undefined;
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that a row view is created for each model in the collection at creation and the lookups are fetched', function() {
        testView = new LinksView({
            collection : testCollection,
            el : '#test-div'
        });

        expect(LinkRowView.prototype.setElement.calls.count()).toBe(3);
        expect(LinkTypeCollection.prototype.fetch).toHaveBeenCalled();
        expect(LinkFileTypeCollection.prototype.fetch).toHaveBeenCalled();
    });

    describe('Tests for render', function() {

        beforeEach(function() {
            testView = new LinksView({
                collection : testCollection,
                el : '#test-div'
            });
            spyOn($.fn, 'sortable');

            testView.render();
        });

        it('Expects that the sortable plugin is set up on the grid', function() {
            expect($.fn.sortable).toHaveBeenCalled();
        });

        it('Expects that link row views are not rendered until the lookups have been fetched', function() {
            expect(renderLinkRowViewSpy).not.toHaveBeenCalled();
        });

        it('Expects that once the lookups have been fetched, the link row views are rendered', function() {
            linkTypeDeferred.resolve();
            expect(renderLinkRowViewSpy).not.toHaveBeenCalled();

            linkFileTypeDeferred.resolve();
            expect(renderLinkRowViewSpy.calls.count()).toBe(3);
        });
    });

    describe('Tests for remove', function() {
        beforeEach(function() {
            testView = new LinksView({
                collection: testCollection,
                el: '#test-div'
            });
        });

        it('Expects that the link row views will also be removed', function() {
            testView.remove();
            expect(LinkRowView.prototype.remove.calls.count()).toBe(3);
        });
    });

    describe('Tests for DOM event handlers', function() {
        beforeEach(function() {
            testView = new LinksView({
                collection: testCollection,
                el: '#test-div'
            });
            testView.render();
        });

        //TODO: Figure out why collection is getting corrupted by this test.
        it('Expects a new model to be added to the collection when calling addNewLink', function() {
            testView.addNewLink();
            expect(testCollection.models.length).toBe(4);
        });
    });

    describe('Tests for collection event handlers', function() {
        beforeEach(function() {
            testView = new LinksView({
                collection: testCollection,
                el: '#test-div'
            });
            testView.render();
        });

        it('Expects that adding a model to the collection causes a new link row view to be added', function() {
            testCollection.add([{id : 4, rank : 4}]);
            expect(LinkRowView.prototype.setElement.calls.count()).toBe(4);
        });

        it('Expects that removing a model from a collection removes it associate view', function() {
            var modelToRemove = testCollection.at(2);
            testCollection.remove(modelToRemove);
            expect(LinkRowView.prototype.remove).toHaveBeenCalled();
            expect(testView.linkRowViews.length).toBe(2);
        });
    });
});
