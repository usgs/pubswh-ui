import $ from 'jquery';
import Backbone from 'backbone';

import AlertView from '../../../../scripts/manager/views/AlertView';
import ManagePublicationsView from '../../../../scripts/manager/views/ManagePublicationsView';
import PublicationCollection from '../../../../scripts/manager/models/PublicationCollection';
import PublicationListCollection from '../../../../scripts/manager/models/PublicationListCollection';
import SearchFilterRowView from '../../../../scripts/manager/views/SearchFilterRowView';
import WarningDialogView from '../../../../scripts/manager/views/WarningDialogView';


// Mocking Backgrid is difficult since it's namespaced and encompasses many different methods
// We will have to be satisified with putting spies on the backrid view objects within testView

describe('ManagePublicationsView', function() {
    let testView, testCollection, testModel;
    let $testDiv;

    let renderWarningDialogSpy;
    let renderSearchFilterRowViewSpy;
    let fetchDeferred, fetchListDeferred;

    beforeEach(function () {

        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');

        renderWarningDialogSpy = jasmine.createSpy('renderWarningDialogSpy');
        renderSearchFilterRowViewSpy = jasmine.createSpy('renderSearchFilterRowViewSpy');

        fetchListDeferred = $.Deferred();
        fetchDeferred = $.Deferred();

        testCollection = new PublicationCollection();
        spyOn(testCollection, 'fetch').and.returnValue(fetchDeferred);
        spyOn(testCollection, 'setPageSize').and.callThrough();

        testModel = new Backbone.Model();

        spyOn(PublicationListCollection.prototype, 'fetch').and.returnValue(fetchListDeferred);
        spyOn(PublicationListCollection.prototype, 'toJSON').and.callFake(function() {
            return [{id : 1, text : 'Pub Cat 1'}, {id : 2, text : 'Pub Cat 2'}];
        });
        spyOn(PublicationListCollection.prototype, 'findWhere').and.callFake(function() {
            let mockModel = new Backbone.Model();
            return mockModel.set({id : 2, text : 'Pub Cat 2'});
        });
        spyOn(AlertView.prototype, 'setElement');
        spyOn(AlertView.prototype, 'render');
        spyOn(AlertView.prototype, 'remove');
        spyOn(AlertView.prototype, 'showSuccessAlert');
        spyOn(AlertView.prototype, 'showDangerAlert');
        spyOn(WarningDialogView.prototype, 'setElement').and.returnValue({
            render : renderWarningDialogSpy
        });
        spyOn(WarningDialogView.prototype, 'render').and.callFake(renderWarningDialogSpy);
        spyOn(WarningDialogView.prototype, 'remove');
        spyOn(WarningDialogView.prototype, 'show');
        spyOn(SearchFilterRowView.prototype, 'setElement').and.returnValue({
                render : renderSearchFilterRowViewSpy
            });
        spyOn(SearchFilterRowView.prototype, 'render').and.callFake(renderSearchFilterRowViewSpy);
        spyOn(SearchFilterRowView.prototype, 'remove');

        testView = new ManagePublicationsView({
            el: '#test-div',
            collection: testCollection,
            model : testModel
        });
    });

    afterEach(function () {
        testView.remove();
        $testDiv.remove();
    });

    it('Expects that the collection contents are fetched at initialization', function () {
        expect(testCollection.fetch).toHaveBeenCalled();
    });

    it('Expects that the publication lists are fetched at initialization', function() {
        expect(PublicationListCollection.prototype.fetch).toHaveBeenCalled();
    });

    it('Expects that the child view\'s are created', function() {
        expect(AlertView.prototype.setElement).toHaveBeenCalled();
        expect(WarningDialogView.prototype.setElement).toHaveBeenCalled();
        expect(testView.grid).toBeDefined();
        expect(testView.paginator).toBeDefined();
    });

    describe('Tests for render', function() {
        beforeEach(function() {
            spyOn(testView.grid, 'render').and.returnValue({
                el : {}
            });
            spyOn(testView.paginator, 'render').and.returnValue({
                el : {}
            });
            spyOn($.fn, 'select2');
        });

        it('Expects that the alertView\'s element is set but the view is not rendered', function() {
            testView.render();

            expect(AlertView.prototype.setElement.calls.count()).toBe(2);
            expect(AlertView.prototype.render).not.toHaveBeenCalled();
        });

        it('Expects the warningDialogView to be rendered', function() {
            testView.render();

            expect(WarningDialogView.prototype.setElement.calls.count()).toBe(2);
            expect(renderWarningDialogSpy).toHaveBeenCalled();
        });

        it('Expects the grid and paginator to have been rendered.', function() {
            testView.render();

            expect(testView.grid.render).toHaveBeenCalled();
            expect(testView.paginator.render).toHaveBeenCalled();
        });

        it('Expects that the loading indicator is shown until the fetch has been resolved', function(done) {
            let $loadingIndicator;
            testView.render();
            $loadingIndicator = testView.$('.pubs-loading-indicator');
            fetchDeferred.then(() => {
                expect($loadingIndicator.is(':visible')).toBe(false);
                done();
            });

            expect($loadingIndicator.is(':visible')).toBe(true);
            fetchDeferred.resolve();
        });

        it('Expects the clear search button to have the button type', function() {
            let $clearSearchBtn;
            testView.render();
            $clearSearchBtn = testView.$('.clear-search-btn');
            expect($clearSearchBtn.attr('type')).toEqual('button');
        });

        it('Expects that the publications list category selector is initialized once the list has been fetched', function(done) {
            testView.render();

            fetchListDeferred.then(() => {
                expect($.fn.select2).toHaveBeenCalled();
                done();
            });
            expect($.fn.select2).not.toHaveBeenCalled();
            fetchListDeferred.resolve();
        });

        it('Expects that the publications list filter is rendered after the list has been fetched', function(done) {
            testView.render();

            fetchListDeferred.then(() => {
                expect($('.usa-unstyled-list').length).toBe(1);
                done();
            });
            expect($('.usa-unstyled-list').length).toBe(0);

            fetchListDeferred.resolve();

        });

        it('Expects the search term to equal the value in model', function() {
            testModel.set('q', 'Mary');
            testView.render();

            expect($testDiv.find('#search-term-input').val()).toEqual('Mary');
        });

        it('Expects the publications list filter to be set if publication lists are set in the model', function(done) {
            testModel.set('listId', {
                useId : true,
                selections : [{id : '2', text : 'Pub Cat 2'}]
            });
            testView.render();
            fetchListDeferred.then(() => {
                expect($testDiv.find('.pub-filter-list-div input:checked').val()).toEqual('2');
                done();
            });
            fetchListDeferred.resolve();
        });

        it('Expects that searchFilterRowViews will be created for any filter other than q or listId when set in the model', function() {
            testModel.set({
                year : '2015',
                prodId : '1234'
            });
            testView.render();

            expect(renderSearchFilterRowViewSpy.calls.count()).toBe(2);
        });
    });

    describe('Tests for remove', function() {
        beforeEach(function() {
            testView.render();
            let $addBtn = testView.$('.add-category-btn');
            $addBtn.trigger('click');
            $addBtn.trigger('click');
            spyOn(testView.grid, 'remove').and.callThrough();
            spyOn(testView.paginator, 'remove').and.callThrough();
        });

        it('Expects the children view to be removed', function() {
            testView.remove();
            expect(AlertView.prototype.remove).toHaveBeenCalled();
            expect(WarningDialogView.prototype.remove).toHaveBeenCalled();
            expect(SearchFilterRowView.prototype.remove.calls.count()).toEqual(2);
            expect(testView.grid.remove).toHaveBeenCalled();
            expect(testView.paginator.remove).toHaveBeenCalled();
        });
    });

    describe('Tests for DOM event handlers', function() {
        beforeEach(function(done) {
            fetchListDeferred.resolve();
            testView.render();

            fetchListDeferred.then(() => {
                done();
            });
        });

        it('Expects that a clicking the search button updates the collection\'s filters and then gets the first page of publications', function() {
            spyOn(testCollection, 'updateFilters');
            spyOn(testCollection, 'getFirstPage').and.callThrough();

            testModel.set({year : '2015'});
            testView.$('.search-btn').trigger('click');

            expect(testCollection.updateFilters).toHaveBeenCalledWith(testModel.attributes);
            expect(testCollection.getFirstPage).toHaveBeenCalled();
        });

        it('Expects that clicking the clear button clears the model and clears the search form', function() {
            testModel.set({
                'q' : 'Water',
                'listId' : {
                    useId : true,
                    selections : [{id : '2', text : 'Pub Cat 2'}]
                },
                year : '2015',
                prodId : '1234'
            });
            $testDiv.find('.clear-search-btn').trigger('click');

            expect(testModel.attributes).toEqual({});
            expect($testDiv.find('#search-term-input').val()).toEqual('');
            expect($testDiv.find('.pub-filter-list-div input:checked').length).toEqual(0);
            expect(testView.filterRowViews.length).toBe(0);
        });

        it('Expects that clicking on a publist checkbox updates the collection\'s filters and then gets the first page', function() {
            const $checkbox1 = testView.$('.pub-filter-list-div input[value="1"]');
            const $checkbox2 = testView.$('.pub-filter-list-div input[value="2"]');
            spyOn(testCollection, 'updateFilters');
            spyOn(testCollection, 'getFirstPage').and.callThrough();

            $checkbox1.prop('checked', true);
            $checkbox1.trigger('change');

            expect(testCollection.updateFilters).toHaveBeenCalledWith({listId : ['1']});
            expect(testCollection.getFirstPage).toHaveBeenCalled();

            $checkbox2.prop('checked', true);
            $checkbox2.trigger('change');

            expect(testCollection.updateFilters.calls.mostRecent().args[0]).toEqual({listId : ['1', '2']});

            $checkbox1.prop('checked', false);
            $checkbox1.trigger('change');

            expect(testCollection.updateFilters.calls.mostRecent().args[0]).toEqual({listId : ['2']});
        });

        it('Expects that when the page size select is changed, the collection\'s page size is updated', function() {
            testView.$('.page-size-select').val('25').trigger('change');
            expect(testCollection.setPageSize).toHaveBeenCalledWith(25);
        });

        it('Expects that changing the search term will update the filterModel\'s q property', function() {
            const $searchInput = testView.$('#search-term-input');
            $searchInput.val('Junk test').trigger('change');
            expect(testModel.get('q')).toEqual('Junk test');

            $searchInput.val('').trigger('change');
            expect(testModel.get('q')).toEqual('');
        });

        it('Expects that clicking the add category btn creates and renders a SearchFilterRowView', function() {
            const $addBtn = testView.$('.add-category-btn');
            $addBtn.trigger('click');
            expect(SearchFilterRowView.prototype.setElement.calls.count()).toBe(2);
            expect(renderSearchFilterRowViewSpy).toHaveBeenCalled();

            $addBtn.trigger('click');
            expect(SearchFilterRowView.prototype.setElement.calls.count()).toBe(4);
            expect(renderSearchFilterRowViewSpy.calls.count()).toBe(2);
        });

        it('Expects that clicking on Add to Lists with no lists selected but publications selected shows the warning dialog', function() {
            testCollection.add([{id : 1, selected : true}, {id : 2}]);
            testView.$('.add-to-lists-btn').trigger('click');
            expect(WarningDialogView.prototype.show).toHaveBeenCalled();
        });

        it('Expects that clicking on Add to List with a list selected but no publications selected shows the warning dialog', function() {
            const $listSelect = testView.$('#pubs-categories-select');
            $listSelect.html('<option value="1" selected>List 1</option>');
            testCollection.add([{id : 1}, {id : 2}]);

            testView.$('.add-to-lists-btn').trigger('click');
            expect(WarningDialogView.prototype.show).toHaveBeenCalled();
        });

        it('Expects an ajax call for each publication list selected with the ids passed as query parameters', function() {
            let args0, args1;
            testView.$('#pubs-categories-select').html('<option value="1" selected>List 1</option><option value="2" selected>List 2</option>');
            testCollection.add([{id : 1, selected: true}, {id : 2}, {id : 3, selected: true}]);

            spyOn($, 'ajax');
            testView.$('.add-to-lists-btn').trigger('click');
            expect($.ajax.calls.count()).toBe(2);
            args0 = $.ajax.calls.argsFor(0)[0];
            args1 = $.ajax.calls.argsFor(1)[0];

            expect(args0.url).toContain('lists/1/pubs');
            expect(args0.url).toContain('publicationId=1&publicationId=3');

            expect(args1.url).toContain('lists/2/pubs');
            expect(args1.url).toContain('publicationId=1&publicationId=3');
        });

        it('Expects that a warning is raised if the Remove from List button is clicked but no publication is selected', function() {
            testView.$('.remove-from-list-btn').trigger('click');
            expect(WarningDialogView.prototype.show).toHaveBeenCalled();
        });

        it('Expects an Ajax call is made for each selected publication when the Remove from List button is clicked', function() {
            testCollection.add([{id : 1, selected: true}, {id : 2}, {id : 3, selected: true}]);
            spyOn($, 'ajax');
            testView.$('.remove-from-list-btn').trigger('click');
            expect($.ajax.calls.count()).toBe(2);
        });
    });

    describe('Tests for model event listeners', function() {
        beforeEach(function(done) {
            testView.render();
            fetchListDeferred.resolve();
            fetchListDeferred.then(() => {
                done();
            });
        });

        it('Expects that if the q term is set, the DOM is updated', function() {
            testModel.set('q', 'water');

            expect($testDiv.find('#search-term-input').val()).toEqual('water');
        });

        it('Expects that if the q term is unset, the DOM is cleared', function() {
            testModel.set('q', 'water');
            testModel.unset('q');

            expect($testDiv.find('#search-term-input').val()).toEqual('');
        });

        it('Expects that if listId is updated, the DOM is updated', function() {
            testModel.set('listId', {
                useId : true,
                selections : [{id : '2', text : 'Pub Cat 2'}]
            });

            expect($testDiv.find('.pub-filter-container input:checked').length).toEqual(1);
            expect($testDiv.find('.remove-from-list-btn').is(':visible')).toBe(true);
            expect($testDiv.find('.remove-from-list-btn').text()).toEqual('Remove Selected Publications From "Pub Cat 2" List');
        });

        it('Expects that if more than one listId is updated, the remove from list button is hidden', function() {
            testModel.set('listId', {
                useId: true,
                selections : [{id : '1', text : 'Pub Cat 1'}, {id : '2', text : 'Pub Cat 2'}]
            });
            expect($testDiv.find('.remove-from-list-btn').is(':visible')).toBe(false);
        });

        it('Expects that if listId is unset, the DOM is cleared', function() {
            testModel.set('listId', {
                useId : true,
                selections : [{id : '2', text : 'Pub Cat 2'}]
            });
            testModel.unset('listId');

            expect($testDiv.find('.pub-filter-container input:checked').length).toEqual(0);
        });
    });

    describe('Tests for collection event listeners', function() {
        beforeEach(function() {
            testView.render();
            fetchDeferred.resolve();
        });

        it('Expects that the loading indicator becomes visible after the fetch start and changes to invisible when the fetch is complete', function() {
            const $loadingIndicator = testView.$('.pubs-loading-indicator');
            expect($loadingIndicator.is(':visible')).toBe(false);
            testCollection.fetch();
            testCollection.trigger('request');
            expect($loadingIndicator.is(':visible')).toBe(true);
            testCollection.trigger('sync');
            expect($loadingIndicator.is(':visible')).toBe(false);
        });
    });
});
