/* jslint browser: true */

/* global define */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global spyOn */
/* global jasmine */
/* global expect */

define([
	'squire',
	'jquery',
	'underscore',
	'module',
	'backbone',
	'backgrid',
	'backgrid-paginator',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'models/PublicationCollection',
	'views/BaseView',
	'hbs!hb_templates/managePublications',
	'hbs!hb_templates/publicationListFilter'
], function(Squire, $, _, module, Backbone, Backgrid, Paginator, BackgridUrlCell, BackgridClientSortingBody,
			PublicationCollection, BaseView, hbTemplate, pubListTemplate) {
	"use strict";

	// Mocking Backgrid is difficult since it's namespaced and encompasses many different methods
	// We will have to be satisified with putting spies on the backrid view objects within testView

	describe('ManagePublicationsView', function() {
		var ManagePublicationsView;
		var testView, testCollection, testModel;
		var injector;
		var $testDiv;

		var setElAlertSpy, renderAlertSpy, removeAlertSpy, successAlertSpy, dangerAlertSpy;
		var setElWarningDialogSpy, renderWarningDialogSpy, removeWarningDialogSpy, showWarningDialogSpy;
		var setElSearchFilterRowViewSpy, renderSearchFilterRowViewSpy, removeSearchFilterRowViewSpy;
		var fetchListSpy;
		var fetchDeferred, fetchListDeferred;
		var pubListTemplateSpy;

		beforeEach(function (done) {

			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			spyOn(sessionStorage, 'searchFilters');

			setElAlertSpy = jasmine.createSpy('setElAlertSpy');
			renderAlertSpy = jasmine.createSpy('renderAlertSpy');
			removeAlertSpy = jasmine.createSpy('removeAlertSpy');
			successAlertSpy = jasmine.createSpy('successAlertSpy');
			dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');

			setElWarningDialogSpy = jasmine.createSpy('setElWarningDialogSpy');
			renderWarningDialogSpy = jasmine.createSpy('renderWarningDialogSpy');
			removeWarningDialogSpy = jasmine.createSpy('removeWarningDialogSpy');
			showWarningDialogSpy = jasmine.createSpy('showWarningDialogSpy');

			setElSearchFilterRowViewSpy = jasmine.createSpy('setElSearchFilterRowViewSpy');
			renderSearchFilterRowViewSpy = jasmine.createSpy('renderSearchFilterRowViewSpy');
			removeSearchFilterRowViewSpy = jasmine.createSpy('removeSearchFilterRowViewSpy');

			fetchListDeferred = $.Deferred();
			fetchListSpy = jasmine.createSpy('fetchListSpy').and.returnValue(fetchListDeferred);

			pubListTemplateSpy = jasmine.createSpy('pubListTemplateSpy').and.callFake(pubListTemplate);

			fetchDeferred = $.Deferred();

			testCollection = new PublicationCollection();
			spyOn(testCollection, 'fetch').and.returnValue(fetchDeferred);
			spyOn(testCollection, 'setPageSize').and.callThrough();

			testModel = new Backbone.Model();

			injector = new Squire();
			/* preloading all modules to see if this eliminates the timeout issue on Jenkins */
			injector.mock('module', module);
			injector.mock('backbone', Backbone);
			injector.mock('underscore', _);
			injector.mock('jquery', $);
			injector.mock('backgrid', Backgrid);
			injector.mock('backgrid-paginator', Paginator);
			injector.mock('views/BackgridUrlCell', BackgridUrlCell);
			injector.mock('views/BackgridClientSortingBody', BackgridClientSortingBody);
			injector.mock('views/BaseView', BaseView);
			injector.mock('hbs!hb_templates/managePublications', hbTemplate);
			injector.mock('hbs!hb_templates/publicationListFilter', pubListTemplateSpy);

			injector.mock('models/PublicationListCollection', Backbone.Collection.extend({
				fetch : fetchListSpy,
				toJSON : function() {
					return [{id : 1, text : 'Pub Cat 1'}, {id : 2, text : 'Pub Cat 2'}];
				}
			}));

			injector.mock('views/AlertView', BaseView.extend({
				setElement: setElAlertSpy,
				render: renderAlertSpy,
				remove: removeAlertSpy,
				showSuccessAlert : successAlertSpy,
				showDangerAlert: dangerAlertSpy
			}));

			injector.mock('views/WarningDialogView', BaseView.extend({
				setElement : setElWarningDialogSpy.and.returnValue({
					render : renderWarningDialogSpy
				}),
				render : renderWarningDialogSpy,
				remove : removeWarningDialogSpy,
				show : showWarningDialogSpy
			}));

			injector.mock('views/SearchFilterRowView', BaseView.extend({
				setElement : setElSearchFilterRowViewSpy.and.returnValue({
					render : renderSearchFilterRowViewSpy
				}),
				render : renderSearchFilterRowViewSpy,
				remove : removeSearchFilterRowViewSpy
			}));

			injector.require(['views/ManagePublicationsView'], function(view) {
				ManagePublicationsView = view;
				testView = new ManagePublicationsView({
					el: '#test-div',
					collection: testCollection,
					model : testModel
				});
				done();
			});
		});

		afterEach(function () {
			injector.remove();
			testView.remove();
			$testDiv.remove();
		});

		it('Expects that the collection contents are fetched at initialization', function () {
			expect(testCollection.fetch).toHaveBeenCalled();
		});

		it('Expects that the publication lists are fetched at initialization', function() {
			expect(fetchListSpy).toHaveBeenCalled();
		});

		it('Expects that the child view\'s are created', function() {
			expect(setElAlertSpy).toHaveBeenCalled();
			expect(setElWarningDialogSpy).toHaveBeenCalled();
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

				expect(setElAlertSpy.calls.count()).toBe(2);
				expect(renderAlertSpy).not.toHaveBeenCalled();
			});

			it('Expects the warningDialogView to be rendered', function() {
				testView.render();

				expect(setElWarningDialogSpy.calls.count()).toBe(2);
				expect(renderWarningDialogSpy).toHaveBeenCalled();
			});

			it('Expects the grid and paginator to have been rendered.', function() {
				testView.render();

				expect(testView.grid.render).toHaveBeenCalled();
				expect(testView.paginator.render).toHaveBeenCalled();
			});

			it('Expects that the loading indicator is shown until the fetch has been resolved', function() {
				var $loadingIndicator;
				testView.render();
				$loadingIndicator = testView.$('.pubs-loading-indicator');
				expect($loadingIndicator.is(':visible')).toBe(true);
				fetchDeferred.resolve();
				expect($loadingIndicator.is(':visible')).toBe(false);
			});

			it('Expects that the publications list category selector is initialized once the list has been fetched', function() {
				testView.render();

				expect($.fn.select2).not.toHaveBeenCalled();
				fetchListDeferred.resolve();
				expect($.fn.select2).toHaveBeenCalled();
			});

			it('Expects that the publications list filter is rendered after the list has been fetched', function() {
				testView.render();

				expect(pubListTemplateSpy).not.toHaveBeenCalled();

				fetchListDeferred.resolve();

				expect(pubListTemplateSpy).toHaveBeenCalled();
			});

			it('Expects the search term to equal the value in model', function() {
				testModel.set('q', 'Mary');
				testView.render();

				expect($testDiv.find('#search-term-input').val()).toEqual('Mary');
			});

			it('Expects the publications list filter to be set if publication lists are set in the model', function() {
				testModel.set('listId', {
					useId : true,
					selections : [{id : '2', text : 'Pub Cat 2'}]
				});
				testView.render();
				fetchListDeferred.resolve();

				expect($testDiv.find('.pub-filter-list-div input:checked').val()).toEqual('2');
			});

			it('Expects that searchFilterRowViewss will be created for any filter other than q or listId when set in the model', function() {
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
				var $addBtn = testView.$('.add-category-btn');
				$addBtn.trigger('click');
				$addBtn.trigger('click');
				spyOn(testView.grid, 'remove').and.callThrough();
				spyOn(testView.paginator, 'remove').and.callThrough();
			});

			it('Expects the children view to be removed', function() {
				testView.remove();
				expect(removeAlertSpy).toHaveBeenCalled();
				expect(removeWarningDialogSpy).toHaveBeenCalled();
				expect(removeSearchFilterRowViewSpy.calls.count()).toEqual(2);
				expect(testView.grid.remove).toHaveBeenCalled();
				expect(testView.paginator.remove).toHaveBeenCalled();
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				fetchListDeferred.resolve();
				testView.render();
			});
			//This test is causing a page reload and I don't know why so disabling it for now.
			xit('Expects that a clicking the search button updates the collection\'s filters and then gets the first page of publications', function() {
				spyOn(testCollection, 'updateFilters');
				spyOn(testCollection, 'getFirstPage').and.callThrough();

				testModel.set({year : '2015'});
				testView.$('.search-btn').trigger('click');

				expect(testCollection.updateFilters).toHaveBeenCalledWith(testModel.attributes);
				expect(testCollection.getFirstPage).toHaveBeenCalled();
			});

			it('Expects that clicking on a publist checkbox updates the collection\'s filters and then gets the first page', function() {
				var $checkbox1 = testView.$('.pub-filter-list-div input[value="1"]');
				var $checkbox2 = testView.$('.pub-filter-list-div input[value="2"]');
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
				var $searchInput = testView.$('#search-term-input');
				$searchInput.val('Junk test').trigger('change');
				expect(testModel.get('q')).toEqual('Junk test');

				$searchInput.val('').trigger('change');
				expect(testModel.get('q')).toEqual('');
			});

			it('Expects that clicking the add category btn creates and renders a SearchFilterRowView', function() {
				var $addBtn = testView.$('.add-category-btn');
				$addBtn.trigger('click');
				expect(setElSearchFilterRowViewSpy.calls.count()).toBe(2);
				expect(renderSearchFilterRowViewSpy).toHaveBeenCalled();

				$addBtn.trigger('click');
				expect(setElSearchFilterRowViewSpy.calls.count()).toBe(4);
				expect(renderSearchFilterRowViewSpy.calls.count()).toBe(2);
			});

			it('Expects that clicking on Add to Lists with no lists selected but publications selected shows the warning dialog', function() {
				testCollection.add([{id : 1, selected : true}, {id : 2}]);
				testView.$('.add-to-lists-btn').trigger('click');
				expect(showWarningDialogSpy).toHaveBeenCalled();
			});

			it('Expects that clicking on Add to List with a list selected but no publications selected shows the warning dialog', function() {
				var $listSelect = testView.$('#pubs-categories-select');
				$listSelect.html('<option value="1" selected>List 1</option>');
				testCollection.add([{id : 1}, {id : 2}]);

				testView.$('.add-to-lists-btn').trigger('click');
				expect(showWarningDialogSpy).toHaveBeenCalled();
			});

			it('Expects an ajax call for each publication list selected with the ids passed as query parameters', function() {
				var args0, args1;
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

		});

		describe('Tests for collection event listeners', function() {
			beforeEach(function() {
				testView.render();
				fetchDeferred.resolve();
			});

			it('Expects that the loading indicator becomes visible after the fetch start and changes to invisible when the fetch is complete', function() {
				var $loadingIndicator = testView.$('.pubs-loading-indicator');
				expect($loadingIndicator.is(':visible')).toBe(false);
				testCollection.fetch();
				testCollection.trigger('request');
				expect($loadingIndicator.is(':visible')).toBe(true);
				testCollection.trigger('sync');
				expect($loadingIndicator.is(':visible')).toBe(false);
			});
		});
	});
});
