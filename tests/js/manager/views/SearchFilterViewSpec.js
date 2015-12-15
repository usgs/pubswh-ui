/* jslint browser: true */

define([
	'squire',
	'jquery',
	'views/BaseView'
], function(Squire, $, BaseView) {
	"use strict";

	var testView, SearchFilterView;

	var setElRowViewSpy, renderRowViewSpy, removeRowViewSpy;

	describe('SearchFilterView', function() {

		beforeEach(function(done) {
			var injector;
			$('body').append('<div id="test-div"></div>');

			setElRowViewSpy = jasmine.createSpy('setElRowViewSpy');
			renderRowViewSpy = jasmine.createSpy('renderRowViewSpy');
			removeRowViewSpy = jasmine.createSpy('removeRowViewSpy');

			injector = new Squire();
			injector.mock('views/SearchFilterRowView', BaseView.extend({
				setElement : setElRowViewSpy.and.returnValue({
					render : renderRowViewSpy
				}),
				render : renderRowViewSpy,
				remove : removeRowViewSpy
			}));

			injector.require(['views/SearchFilterView'], function(view) {
				SearchFilterView = view;

				done();
			});
		});

		afterEach(function() {
			testView.remove();
			$('#test-div').remove();
		});

		it('Expects the view to create an empty model to contain the filters at initialization', function() {
			testView = new SearchFilterView({el : '#test-div'});

			expect(testView.model).toBeDefined();
			expect(setElRowViewSpy).not.toHaveBeenCalled();
		});

		describe('Tests for DOM event handlers', function() {

			beforeEach(function() {
				testView = new SearchFilterView({el : '#test-div'});
				testView.render();
			});

			it('Expects that if the search term input is updated, the \'q property in the model is updated.', function() {
				var $searchInput = testView.$('#search-term-input')
				$searchInput.val('Junk test').trigger('change');
				expect(testView.model.get('q')).toEqual('Junk test');

				$searchInput.val('').trigger('change');
				expect(testView.model.get('q')).toEqual('');
			});

			it('Expects that clicking the add category btn creates and renders a SearchFilterRowView', function() {
				var $addBtn = testView.$('.add-category-btn');
				$addBtn.trigger('click');
				expect(setElRowViewSpy.calls.count()).toBe(2);
				expect(renderRowViewSpy).toHaveBeenCalled();

				$addBtn.trigger('click');
				expect(setElRowViewSpy.calls.count()).toBe(4);
				expect(renderRowViewSpy.calls.count()).toBe(2);
			});

			it('Expects that clicking the clear filter btn removes all filter rows from the view', function() {
				var $clearBtn = testView.$('.clear-advanced-search-btn');
				var $addBtn = testView.$('.add-category-btn');

				$clearBtn.trigger('click');
				//Nothing to remove yet
				expect(removeRowViewSpy).not.toHaveBeenCalled();

				$addBtn.trigger('click');
				$addBtn.trigger('click');

				$clearBtn.trigger('click');
				expect(removeRowViewSpy.calls.count()).toBe(2);
			});
		});

		describe('Tests for model event handlers', function() {
			beforeEach(function() {
				testView = new SearchFilterView({el : '#test-div'});
				testView.render();
			});

			it('Expects that updating the q property will update the search term input', function() {
				var $searchInput = testView.$('#search-term-input');

				testView.model.set('q', 'New term');
				expect($searchInput.val()).toEqual('New term');

				testView.model.set('q', '');
				expect($searchInput.val()).toEqual('');
			});
		});
	});
});
