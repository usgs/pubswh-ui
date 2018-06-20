import Squire from 'squire';
import $ from 'jquery';
import _ from 'underscore';

import PublicationContributorCollection from '../../../../scripts/manager/models/PublicationContributorCollection';
import PublicationContributorModel from '../../../../scripts/manager/models/PublicationContributorModel';


describe('ContributorTabView', function() {
    var ContributorTabView, testView;
    var testCollection;
    var CONTRIB_TYPE = {id : 1, text : 'Type1'};

    var setElContribRowViewSpy, renderContribRowViewSpy, removeContribRowViewSpy;
    var appendToSpy;
    var injector;

    beforeEach(function (done) {
        $('body').append('<div id="test-div">');

        testCollection = new PublicationContributorCollection([{
            contributorId : 1,
            contributorType : CONTRIB_TYPE,
            rank : 1
        },{
            contributorId : 3,
            contributorType : CONTRIB_TYPE,
            rank : 3
        },{
            contributorId : 2,
            contributorType : CONTRIB_TYPE,
            rank : 2
        }]);
        setElContribRowViewSpy = jasmine.createSpy('setElLinkRowViewSpy');
        renderContribRowViewSpy = jasmine.createSpy('renderLinkRowViewSpy');
        removeContribRowViewSpy = jasmine.createSpy('removeLinkRowViewSpy');
        appendToSpy = jasmine.createSpy('appendToSpy');

        injector = new Squire();
        injector.mock('jquery', $);// Needed to spy on sortable call
        injector.mock('views/ContributorRowView', Backbone.View.extend({
            setElement : setElContribRowViewSpy.and.returnValue({
                render : renderContribRowViewSpy
            }),
            render : renderContribRowViewSpy,
            remove : removeContribRowViewSpy,
            $el : {
                appendTo : appendToSpy
            }
        }));
        injector.require(['views/ContributorTabView'], function(view) {
            ContributorTabView = view;
            done();
        });
    });

    afterEach(function () {
        injector.remove();
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that a row child view for each model in the collection is created', function() {
        testView = new ContributorTabView({
            el : '#test-div',
            contributorType : CONTRIB_TYPE,
            collection : testCollection
        });
        expect(testView.rowViews.length).toBe(3);
        expect(setElContribRowViewSpy.calls.count()).toBe(3);
    });

    describe('Tests for render', function() {
        beforeEach(function() {
            testView = new ContributorTabView({
                el: '#test-div',
                contributorType: CONTRIB_TYPE,
                collection: testCollection
            });
        });

        it('Expects that the row views are sorted by it\'s model\'s rank and then rendered', function() {
            testView.render();
            expect(testView.rowViews[0].model.attributes).toEqual({contributorId : 1, contributorType : CONTRIB_TYPE, rank : 1});
            expect(testView.rowViews[1].model.attributes).toEqual({contributorId : 2, contributorType : CONTRIB_TYPE, rank : 2});
            expect(testView.rowViews[2].model.attributes).toEqual({contributorId : 3, contributorType : CONTRIB_TYPE, rank : 3});

            expect(renderContribRowViewSpy.calls.count()).toBe(3);
            expect(setElContribRowViewSpy.calls.count()).toBe(6);
        });

        it('Expects that the sortable plugin is initialized', function() {
            spyOn($.fn, 'sortable');
            testView.render();
            expect($.fn.sortable).toHaveBeenCalled();
        });
    });

    describe('Tests for remove', function() {
        beforeEach(function() {
            testView = new ContributorTabView({
                el: '#test-div',
                contributorType: CONTRIB_TYPE,
                collection: testCollection
            });
        });

        it('Expects that child row views are removed', function() {
            testView.remove();
            expect(removeContribRowViewSpy.calls.count()).toBe(3);
        });
    });

    describe('Tests for addNewRow', function() {
        beforeEach(function() {
            testView = new ContributorTabView({
                el: '#test-div',
                contributorType: CONTRIB_TYPE,
                collection: testCollection
            });
        });

        it('Expects that a new model is added to the collection with it\'s rank and contributorType set', function() {
            testView.addNewRow();

            expect(testCollection.length).toBe(4);
            expect(testCollection.at(3).attributes).toEqual({
                contributorType : CONTRIB_TYPE,
                rank : 4
            });
        });
    });

    describe('Tests for collection events', function() {
        beforeEach(function() {
            testView = new ContributorTabView({
                el: '#test-div',
                contributorType: CONTRIB_TYPE,
                collection: testCollection
            });
        });
        it('Expects that adding a new model to the collection before render has been called, creates a new view but does not render it until the view\'s render is called', function() {
            var newModel = new PublicationContributorModel({contributorType : CONTRIB_TYPE, rank : 4});
            var childViewCount = setElContribRowViewSpy.calls.count();
            testCollection.add(newModel);

            expect(setElContribRowViewSpy.calls.count()).toBe(childViewCount + 1);
            expect(renderContribRowViewSpy).not.toHaveBeenCalled();

            testView.render();
            expect(setElContribRowViewSpy.calls.count()).toBe(childViewCount * 2 + 2);
            expect(renderContribRowViewSpy.calls.count()).toBe(childViewCount + 1);
        });

        it('Expects that adding a new model to the collection after render has been called, renders the new view immediately', function() {
            var newModel = new PublicationContributorModel({contributorType : CONTRIB_TYPE, rank : 4});
            var childViewCount;

            testView.render();
            childViewCount = renderContribRowViewSpy.calls.count();
            testCollection.add(newModel);

            expect(setElContribRowViewSpy.calls.count()).toBe(childViewCount * 2 + 2);
            expect(renderContribRowViewSpy.calls.count()).toBe(childViewCount + 1);
        });

        it('Expects that removing a model from the collection removes the corresponding child view', function() {
            var modelToRemove = testCollection.at(1);
            testCollection.remove(modelToRemove);

            expect(removeContribRowViewSpy).toHaveBeenCalled();
            expect(testView.rowViews.length).toBe(2);
            expect(_.findIndex(testView.rowViews, function(view) {
                return view.model === modelToRemove;
            })).toBe(-1);
        });
    });
});
