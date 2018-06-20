import Squire from 'squire';
import $ from 'jquery';

import LinkCollection from '../../../../scripts/manager/models/LinkCollection';


describe('LinksView', function() {

    var LinksView, testView;
    var testCollection;
    var fetchDeferred, linkTypeDeferred, linkFileTypeDeferred;
    var fetchLinkTypeSpy, fetchLinkFileTypeSpy;
    var setElLinkRowViewSpy, renderLinkRowViewSpy, removeLinkRowViewSpy;
    var appendToSpy;
    var injector;

    beforeEach(function(done) {
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

        setElLinkRowViewSpy = jasmine.createSpy('setElLinkRowViewSpy');
        renderLinkRowViewSpy = jasmine.createSpy('renderLinkRowViewSpy');
        removeLinkRowViewSpy = jasmine.createSpy('removeLinkRowViewSpy');
        appendToSpy = jasmine.createSpy('appendToSpy');

        fetchLinkTypeSpy = jasmine.createSpy('fetchLinkTypeSpy').and.returnValue(linkTypeDeferred.promise());
        fetchLinkFileTypeSpy = jasmine.createSpy('fetchLinkFileTypeSpy').and.returnValue(linkFileTypeDeferred.promise());

        injector = new Squire();
        injector.mock('jquery', $);
        injector.mock('models/LinkTypeCollection', Backbone.Collection.extend({
            fetch : fetchLinkTypeSpy
        }));
        injector.mock('models/LinkFileTypeCollection', Backbone.Collection.extend({
            fetch : fetchLinkFileTypeSpy
        }));
        injector.mock('views/LinkRowView', Backbone.View.extend({
            setElement : setElLinkRowViewSpy.and.returnValue({
                render : renderLinkRowViewSpy
            }),
            render : renderLinkRowViewSpy,
            remove : removeLinkRowViewSpy,
            $el : {
                appendTo : appendToSpy
            }
        }));
        injector.require(['views/LinksView'], function(view) {
            LinksView = view;
            done();
        });
    });

    afterEach(function() {
        injector.remove();
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that a row view is created for each model in the collection at creation and the lookups are fetched', function() {
        testView = new LinksView({
            collection : testCollection,
            el : '#test-div'
        });

        expect(setElLinkRowViewSpy.calls.count()).toBe(3);
        expect(fetchLinkTypeSpy).toHaveBeenCalled();
        expect(fetchLinkFileTypeSpy).toHaveBeenCalled();
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
            expect(removeLinkRowViewSpy.calls.count()).toBe(3);
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
            expect(setElLinkRowViewSpy.calls.count()).toBe(4);
        });

        it('Expects that removing a model from a collection removes it associate view', function() {
            var modelToRemove = testCollection.at(2);
            testCollection.remove(modelToRemove);
            expect(removeLinkRowViewSpy).toHaveBeenCalled();
            expect(testView.linkRowViews.length).toBe(2);
        });
    });
});
