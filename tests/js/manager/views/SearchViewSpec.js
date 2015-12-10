/* jslint browser: true */

define([
	'squire',
	'sinon',
	'jquery',
	'models/PublicationCollection',
	'views/BaseView',
], function(Squire, sinon, $, PublicationCollection, BaseView) {
	"use strict";

	// Mocking Backgrid is difficult since it's namespaced and encompasses many different methods
	// We will have to be satisified with putting spies on the backrid view objects within testView

	jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

	describe('SearchView', function() {
		var SearchView;
		var testView, testCollection;
		var server;

		var setElAlertSpy, renderAlertSpy, removeAlertSpy, dangerAlertSpy;

		beforeEach(function (done) {
			var injector;
			$('body').append('<div id="test-div"></div>');

			setElAlertSpy = jasmine.createSpy('setElAlertSpy');
			renderAlertSpy = jasmine.createSpy('renderAlertSpy');
			removeAlertSpy = jasmine.createSpy('removeAlertSpy');
			dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');

			testCollection = new PublicationCollection();
			spyOn(testCollection, 'fetch').and.callThrough();
			spyOn(testCollection, 'setPageSize').and.callThrough();

			injector = new Squire();
			injector.mock('views/AlertView', BaseView.extend({
				setElement: setElAlertSpy,
				render: renderAlertSpy,
				remove: removeAlertSpy,
				showDangerAlert: dangerAlertSpy
			}));

			injector.require(['views/SearchView'], function(view) {
				SearchView = view;
				// Don't set up the fake server until after dependencies have been loaded

				server = sinon.fakeServer.create();
				server.respondWith('{"pageSize":"3","pageRowStart":"0","pageNumber":null,"recordCount":3,"records":' +
				'[{"id":70004236,"text":"70004236 - noyr - Estimates of In-Place Oil Shale", "lastModifiedDate":"2015-12-02T09:59:51","indexId":"70004236","publicationYear":"2015","publicationType":{"id":4,"text":"Book"},"title":"Estimates of In-Place Oil Shale"},' +
				'{"id":70004244,"text":"70004244 - noyr - Diversity of the Lunar Maria", "lastModifiedDate":"2012-07-23T14:22:01","indexId":"70004244","publicationYear":"2014","publicationType":{"id":4,"text":"Book"},"title":"Diversity of the Lunar Maria"},' +
				'{"id":70004243,"text":"70004243 - noyr - Developing Climate Data Records","lastModifiedDate":"2012-03-27T16:31:33","indexId":"70004243","publicationYear":"2014","publicationType":{"id":4,"text":"Book"},"title":"Developing Climate Data Records"}]}');
				done();
			});
		});

		afterEach(function () {
			server.restore();
			$('#test-div').remove();
		});

		it('Expects that the collection contents are fetched at initialization', function () {
			testView = new SearchView({
				el: '#test-div',
				collection: testCollection
			});
			expect(testCollection.fetch).toHaveBeenCalled();
		});

		it('Expects that the child view\'s are created', function() {
			testView = new SearchView({
				el: '#test-div',
				collection: testCollection
			});

			expect(setElAlertSpy).toHaveBeenCalled();
			expect(testView.grid).toBeDefined();
			expect(testView.paginator).toBeDefined();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView = new SearchView({
					el: '#test-div',
					collection: testCollection
				});

				spyOn(testView.grid, 'render').and.returnValue({
					el : {}
				});
				spyOn(testView.paginator, 'render').and.returnValue({
					el : {}
				});
			});

			it('Expects that the alertView\'s element is set but the view is not rendered', function() {
				testView.render();
				expect(setElAlertSpy.calls.count()).toBe(2);
				expect(renderAlertSpy).not.toHaveBeenCalled();
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
				server.respond();
				expect($loadingIndicator.is(':visible')).toBe(false);
				expect(testView.$('.pubs-count').html()).toEqual('3');
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView = new SearchView({
					el: '#test-div',
					collection: testCollection
				});

				spyOn(testView.grid, 'remove').and.callThrough();
				spyOn(testView.paginator, 'remove').and.callThrough();
			});

			it('Expects the children view to be removed', function() {
				testView.remove();
				expect(removeAlertSpy).toHaveBeenCalled();
				expect(testView.grid.remove).toHaveBeenCalled();
				expect(testView.paginator.remove).toHaveBeenCalled();
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				testView = new SearchView({
					el: '#test-div',
					collection: testCollection
				});
			});

			it('Expects that a call to filterPubs updates the collection\'s filters and then gets the first page of publications', function() {
				var ev = {
					preventDefault : jasmine.createSpy('preventDefaultSpy')
				};
				spyOn(testCollection, 'updateFilters');
				spyOn(testCollection, 'getFirstPage').and.callThrough();

				testView.render();
				testView.$('#search-term-input').val('Search term');
				testView.filterPubs(ev);

				expect(testCollection.updateFilters).toHaveBeenCalledWith({q : 'Search term'});
				expect(testCollection.getFirstPage).toHaveBeenCalled();
			});

			it('Expects that when the page size select is changed, the collection\'s page size is updated', function() {
				testView.render();
				testView.$('.page-size-select').val('25').trigger('change');
				expect(testCollection.setPageSize).toHaveBeenCalledWith(25);
			})
		});

		describe('Tests for collection event listeners', function() {
			beforeEach(function() {
				testView = new SearchView({
					el: '#test-div',
					collection: testCollection
				});
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
