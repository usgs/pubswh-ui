/* jslint browser: true */

define([
	'squire',
	'sinon',
	'jquery',
	'backbone',
	'backgrid',
	'backgrid-paginator',
	'views/BackgridUrlCell',
	'views/BackgridClientSortingBody',
	'models/PublicationCollection',
	'views/BaseView',
	'hbs!hb_templates/managePublications'
], function(Squire, sinon, $, Backbone, Backgrid, Paginator, BackgridUrlCell, BackgridClientSortingBody,
			PublicationCollection, BaseView, hbTemplate) {
	"use strict";

	// Mocking Backgrid is difficult since it's namespaced and encompasses many different methods
	// We will have to be satisified with putting spies on the backrid view objects within testView

	jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

	describe('ManagePublicationsView', function() {
		var ManagePublicationsView;
		var testView, testCollection;
		var server;
		var injector;

		var setElAlertSpy, renderAlertSpy, removeAlertSpy, dangerAlertSpy;
		var setElSearchFilterRowViewSpy, renderSearchFilterRowViewSpy, removeSearchFilterRowViewSpy;

		beforeEach(function (done) {
			$('body').append('<div id="test-div"></div>');

			setElAlertSpy = jasmine.createSpy('setElAlertSpy');
			renderAlertSpy = jasmine.createSpy('renderAlertSpy');
			removeAlertSpy = jasmine.createSpy('removeAlertSpy');
			dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');

			setElSearchFilterRowViewSpy = jasmine.createSpy('setElSearchFilterRowViewSpy');
			renderSearchFilterRowViewSpy = jasmine.createSpy('renderSearchFilterRowViewSpy');
			removeSearchFilterRowViewSpy = jasmine.createSpy('removeSearchFilterRowViewSpy');

			testCollection = new PublicationCollection();
			spyOn(testCollection, 'fetch').and.callThrough();
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
				// Don't set up the fake server until after dependencies have been loaded

				server = sinon.fakeServer.create();
				server.respondWith('{"pageSize":"3","pageRowStart":"0","pageNumber":null,"recordCount":3,"records":' +
				'[{"id":70004236,"text":"70004236 - noyr - Estimates of In-Place Oil Shale", "lastModifiedDate":"2015-12-02T09:59:51","indexId":"70004236","publicationYear":"2015","publicationType":{"id":4,"text":"Book"},"title":"Estimates of In-Place Oil Shale"},' +
				'{"id":70004244,"text":"70004244 - noyr - Diversity of the Lunar Maria", "lastModifiedDate":"2012-07-23T14:22:01","indexId":"70004244","publicationYear":"2014","publicationType":{"id":4,"text":"Book"},"title":"Diversity of the Lunar Maria"},' +
				'{"id":70004243,"text":"70004243 - noyr - Developing Climate Data Records","lastModifiedDate":"2012-03-27T16:31:33","indexId":"70004243","publicationYear":"2014","publicationType":{"id":4,"text":"Book"},"title":"Developing Climate Data Records"}]}');

				testView = new ManagePublicationsView({
					el: '#test-div',
					collection: testCollection
				});
				done();
			});
		});

		afterEach(function () {
			injector.remove();
			server.restore();
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
				server.respond();
				expect($loadingIndicator.is(':visible')).toBe(false);
				expect(testView.$('.pubs-count').html()).toEqual('3');
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
				server.respond();
			});

			it('Expects that the loading indicator becomes visible after the fetch start and changes to invisible when the fetch is complete', function() {
				var $loadingIndicator = testView.$('.pubs-loading-indicator');
				var $pubsCount = testView.$('.pubs-count');
				expect($loadingIndicator.is(':visible')).toBe(false);
				expect($pubsCount.html()).toEqual('3');
				testCollection.fetch();
				expect($loadingIndicator.is(':visible')).toBe(true);
				server.respond();
				expect($loadingIndicator.is(':visible')).toBe(false);
			});
		});
	});
});
