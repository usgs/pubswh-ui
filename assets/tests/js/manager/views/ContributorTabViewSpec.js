import $ from 'jquery';
import _ from 'underscore';

import ContributorRowView from '../../../../scripts/manager/views/ContributorRowView';
import ContributorTabView from '../../../../scripts/manager/views/ContributorTabView';
import PublicationContributorCollection from '../../../../scripts/manager/models/PublicationContributorCollection';
import PublicationContributorModel from '../../../../scripts/manager/models/PublicationContributorModel';


describe('ContributorTabView', function() {
    var testView;
    var testCollection;
    var CONTRIB_TYPE = {id : 1, text : 'Type1'};

    var renderContribRowViewSpy;
    var appendToSpy;

    beforeEach(function () {
        $('body').append('<div id="test-div"></div>');

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
        renderContribRowViewSpy = jasmine.createSpy('renderLinkRowViewSpy');
        appendToSpy = jasmine.createSpy('appendToSpy');

        spyOn(ContributorRowView.prototype, 'setElement').and.returnValue({
            render : renderContribRowViewSpy
        });
        spyOn(ContributorRowView.prototype, 'render').and.callFake(renderContribRowViewSpy);
        spyOn(ContributorRowView.prototype, 'remove');
        ContributorRowView.prototype.$el = {
            appendTo : appendToSpy
        };
    });

    afterEach(function () {
        ContributorRowView.prototype.$el = undefined;
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
        expect(ContributorRowView.prototype.setElement.calls.count()).toBe(3);
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
            console.log($.fn.sortable);
            testView.render();
            expect(testView.rowViews[0].model.attributes).toEqual({contributorId : 1, contributorType : CONTRIB_TYPE, rank : 1});
            expect(testView.rowViews[1].model.attributes).toEqual({contributorId : 2, contributorType : CONTRIB_TYPE, rank : 2});
            expect(testView.rowViews[2].model.attributes).toEqual({contributorId : 3, contributorType : CONTRIB_TYPE, rank : 3});

            expect(renderContribRowViewSpy.calls.count()).toBe(3);
            expect(ContributorRowView.prototype.setElement.calls.count()).toBe(6);
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
            expect(ContributorRowView.prototype.remove.calls.count()).toBe(3);
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
            var childViewCount = ContributorRowView.prototype.setElement.calls.count();
            testCollection.add(newModel);

            expect(ContributorRowView.prototype.setElement.calls.count()).toBe(childViewCount + 1);
            expect(renderContribRowViewSpy).not.toHaveBeenCalled();

            testView.render();
            expect(ContributorRowView.prototype.setElement.calls.count()).toBe(childViewCount * 2 + 2);
            expect(renderContribRowViewSpy.calls.count()).toBe(childViewCount + 1);
        });

        it('Expects that adding a new model to the collection after render has been called, renders the new view immediately', function() {
            var newModel = new PublicationContributorModel({contributorType : CONTRIB_TYPE, rank : 4});
            var childViewCount;

            testView.render();
            childViewCount = renderContribRowViewSpy.calls.count();
            testCollection.add(newModel);

            expect(ContributorRowView.prototype.setElement.calls.count()).toBe(childViewCount * 2 + 2);
            expect(renderContribRowViewSpy.calls.count()).toBe(childViewCount + 1);
        });

        it('Expects that removing a model from the collection removes the corresponding child view', function() {
            var modelToRemove = testCollection.at(1);
            testCollection.remove(modelToRemove);

            expect(ContributorRowView.prototype.remove).toHaveBeenCalled();
            expect(testView.rowViews.length).toBe(2);
            expect(_.findIndex(testView.rowViews, function(view) {
                return view.model === modelToRemove;
            })).toBe(-1);
        });
    });
});
