/* jslint browser: true */
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
	'backbone',
	'backgrid',
	'backgrid-paginator',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'models/PublicationCollection',
	'views/BaseView',
	'hbs!hb_templates/managePublications'
], function(Squire, $, Backbone, Backgrid, Paginator, BackgridUrlCell, BackgridClientSortingBody,
			PublicationCollection, BaseView, hbTemplate) {
	"use strict";

	// Mocking Backgrid is difficult since it's namespaced and encompasses many different methods
	// We will have to be satisified with putting spies on the backrid view objects within testView

	describe('ManagePublicationsView', function() {
		var ManagePublicationsView;
		var testView, testCollection;
		var injector;

		var setElAlertSpy, renderAlertSpy, removeAlertSpy, dangerAlertSpy;
		var setElSearchFilterRowViewSpy, renderSearchFilterRowViewSpy, removeSearchFilterRowViewSpy;
		var fetchDeferred;

		beforeEach(function (done) {
			$('body').append('<div id="test-div"></div>');

			setElAlertSpy = jasmine.createSpy('setElAlertSpy');
			renderAlertSpy = jasmine.createSpy('renderAlertSpy');
			removeAlertSpy = jasmine.createSpy('removeAlertSpy');
			dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');

			setElSearchFilterRowViewSpy = jasmine.createSpy('setElSearchFilterRowViewSpy');
			renderSearchFilterRowViewSpy = jasmine.createSpy('renderSearchFilterRowViewSpy');
			removeSearchFilterRowViewSpy = jasmine.createSpy('removeSearchFilterRowViewSpy');

			fetchDeferred = $.Deferred();

			testCollection = new PublicationCollection();
			spyOn(testCollection, 'fetch').and.returnValue(fetchDeferred);
			spyOn(testCollection, 'setPageSize').and.callThrough();

			injector = new Squire();
			/* preloading all modules to see if this eliminates the timout issue on Jenkins */
			injector.mock('backbone', Backbone);
			injector.mock('backgrid', Backgrid);
			injector.mock('backgrid-paginator', Paginator);
			injector.mock('views/BackgridUrlCell', BackgridUrlCell);
			injector.mock('views/BackgridClientSortingBody', BackgridClientSortingBody);
			injector.mock('views/BaseView', BaseView);
			injector.mock('hbs!hb_templates/managePublications', hbTemplate);

			injector.mock('views/AlertView', BaseView.extend({
				setElement: setElAlertSpy,
				render: renderAlertSpy,
				remove: removeAlertSpy,
				showDangerAlert: dangerAlertSpy
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
					collection: testCollection
				});
				done();
			});
		});

		afterEach(function () {
			injector.remove();
			testView.remove();
			$('#test-div').remove();
		});

		it('Expects that a filterModel property is created at initialzation', function() {
			expect(testView.filterModel).toBeDefined();
		});

		it('Expects that the collection contents are fetched at initialization', function () {
			expect(testCollection.fetch).toHaveBeenCalled();
		});

		it('Expects that the child view\'s are created', function() {
			expect(setElAlertSpy).toHaveBeenCalled();
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
				testView.render();
			});

			it('Expects that the alertView\'s element is set but the view is not rendered', function() {
				expect(setElAlertSpy.calls.count()).toBe(2);
				expect(renderAlertSpy).not.toHaveBeenCalled();
			});

			it('Expects the grid and paginator to have been rendered.', function() {
				expect(testView.grid.render).toHaveBeenCalled();
				expect(testView.paginator.render).toHaveBeenCalled();
			});

			it('Expects that the loading indicator is shown until the fetch has been resolved', function() {
				var $loadingIndicator;

				$loadingIndicator = testView.$('.pubs-loading-indicator');
				expect($loadingIndicator.is(':visible')).toBe(true);
				fetchDeferred.resolve();
				expect($loadingIndicator.is(':visible')).toBe(false);
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
				expect(removeSearchFilterRowViewSpy.calls.count()).toEqual(2);
				expect(testView.grid.remove).toHaveBeenCalled();
				expect(testView.paginator.remove).toHaveBeenCalled();
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				testView.render();
			});
			it('Expects that a clicking the search button updates the collection\'s filters and then gets the first page of publications', function() {
				spyOn(testCollection, 'updateFilters');
				spyOn(testCollection, 'getFirstPage').and.callThrough();

				testView.filterModel.set({q : 'Search term', year : '2015'});
				testView.$('.search-btn').trigger('click');

				expect(testCollection.updateFilters).toHaveBeenCalledWith(testView.filterModel.attributes);
				expect(testCollection.getFirstPage).toHaveBeenCalled();
			});

			it('Expects that when the page size select is changed, the collection\'s page size is updated', function() {
				testView.$('.page-size-select').val('25').trigger('change');
				expect(testCollection.setPageSize).toHaveBeenCalledWith(25);
			});

			it('Expects that changing the search term will update the filterModel\'s q property', function() {
				var $searchInput = testView.$('#search-term-input')
				$searchInput.val('Junk test').trigger('change');
				expect(testView.filterModel.get('q')).toEqual('Junk test');

				$searchInput.val('').trigger('change');
				expect(testView.filterModel.get('q')).toEqual('');
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
