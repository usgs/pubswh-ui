import $ from 'jquery';
import Backbone from 'backbone';

import BaseView from '../../../../scripts/manager/views/BaseView';
import ContributorsView from '../../../../scripts/manager/views/ContributorsView';
import ContributorTabView from '../../../../scripts/manager/views/ContributorTabView';
import ContributorTypeCollection from '../../../../scripts/manager/models/ContributorTypeCollection';


describe('ContributorsView', function() {
    var testView;

    var renderContribTabSpy;

    var publicationModel;
    var contributorsModel;
    var fetchContribTypeDeferred;

    beforeEach(function () {
        $('body').append('<div id="test-div"></div>');

        publicationModel = new Backbone.Model(); // this is the model passed to the contributors view
        contributorsModel = new Backbone.Model();
        publicationModel.set('contributors', contributorsModel);

        fetchContribTypeDeferred = $.Deferred();

        renderContribTabSpy = jasmine.createSpy('renderContributorsSpy');

        spyOn(ContributorTabView.prototype, 'setElement').and.returnValue({
            render: renderContribTabSpy
        });
        spyOn(ContributorTabView.prototype, 'render');
        spyOn(ContributorTabView.prototype, 'remove').and.callFake(renderContribTabSpy);
        spyOn(ContributorTabView.prototype, '$');
        spyOn(ContributorTypeCollection.prototype, 'fetch').and.returnValue(fetchContribTypeDeferred);
    });

    afterEach(function () {
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that when creating a view the contributor types are fetched', function () {
        testView = new ContributorsView({
            el: '#test-div',
            model: contributorsModel
        });

        expect(ContributorTypeCollection.prototype.fetch).toHaveBeenCalled();
    });

    it('Expects that a child tab view and a model property are created for each contributor type after the successful fetch', function() {
        testView = new ContributorsView({
            el: '#test-div',
            model: publicationModel
        });
        expect(testView.typeTabViews).not.toBeDefined();

        testView.contributorTypeCollection = new Backbone.Collection([{id : 1, text : 'Type1'}, {id : 2, text : 'Type2'}]);
        fetchContribTypeDeferred.resolve();
        expect(testView.typeTabViews.length).toBe(2);

        expect(contributorsModel.has('type1')).toBe(true);
        expect(contributorsModel.has('type2')).toBe(true);
    });

    describe('Tests for render', function() {
        beforeEach(function() {
            testView = new ContributorsView({
                el : '#test-div',
                model : publicationModel
            });
        });

        it('Expects that the view and any children will not be rendered before the contributor types have been fetched', function() {
            spyOn(BaseView.prototype, 'render').and.callThrough();
            testView.render();
            expect(BaseView.prototype.render).not.toHaveBeenCalled();
            expect(ContributorTabView.prototype.setElement).not.toHaveBeenCalled();
            expect(renderContribTabSpy).not.toHaveBeenCalled();

            testView.contributorTypeCollection = new Backbone.Collection([{id : 1, text : 'Type1'}, {id : 2, text : 'Type2'}]);
            fetchContribTypeDeferred.resolve();
            expect(BaseView.prototype.render).toHaveBeenCalled();
            expect(ContributorTabView.prototype.setElement.calls.count()).toBe(4);// Called twice for each child view
            expect(renderContribTabSpy.calls.count()).toBe(2);
        });
    });

    describe('Tests for remove', function() {

        beforeEach(function() {
            testView = new ContributorsView({
                el : '#test-div',
                model : publicationModel
            });

            testView.contributorTypeCollection = new Backbone.Collection([{id : 1, text : 'Type1'}, {id : 2, text : 'Type2'}]);
            fetchContribTypeDeferred.resolve();
        });

        it('Expects that the child views are removed when remove is called', function() {
            testView.remove();
            expect(ContributorTabView.prototype.remove.calls.count()).toBe(2);
        });
    });
});
