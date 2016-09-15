/* jslint browser: true */

define([
	'squire',
	'jquery',
	'backbone',
	'views/BaseView',
	'models/LookupModel',
], function(Squire, $, Backbone, BaseView, LookupModel) {
	"use strict";


	describe('ContributorsView', function() {

		var ContributorsView;
		var testView;

		var renderBaseViewSpy;
		var setElContribTabSpy, renderContribTabSpy, removeContribTabSpy, findElContribTabSpy;
		var fetchContribTypeSpy;

		var publicationModel;
		var contributorsModel;
		var fetchContribTypeDeferred;
		var injector;

		beforeEach(function (done) {
			$('body').append('<div id="test-div"></div>');

			publicationModel = new Backbone.Model(); // this is the model passed to the contributors view
			contributorsModel = new Backbone.Model();
			publicationModel.set("contributors", contributorsModel);

			fetchContribTypeDeferred = $.Deferred();

			setElContribTabSpy = jasmine.createSpy('setElContributorsSpy');
			renderContribTabSpy = jasmine.createSpy('renderContributorsSpy');
			removeContribTabSpy = jasmine.createSpy('removeContributorsSpy');
			findElContribTabSpy = jasmine.createSpy('findElContributorsSpy');

			fetchContribTypeSpy = jasmine.createSpy('fetchContribTypeSpy').and.returnValue(fetchContribTypeDeferred);

			injector = new Squire();

			injector.mock('views/BaseView', BaseView); // needed to spy on BaseView functions
			injector.mock('views/ContributorTabView', BaseView.extend({
				setElement: setElContribTabSpy.and.returnValue({
					render: renderContribTabSpy
				}),
				render: renderContribTabSpy,
				remove: removeContribTabSpy,
				$: findElContribTabSpy
			}));

			injector.mock('models/ContributorTypeCollection', Backbone.Collection.extend({
				model: LookupModel,
				fetch: fetchContribTypeSpy
			}));

			injector.require(['views/ContributorsView'], function (view) {
				ContributorsView = view;
				done();
			});
		});

		afterEach(function () {
			injector.remove();
			testView.remove();
			$('#test-div').remove();
		});

		it('Expects that when creating a view the contributor types are fetched', function () {
			testView = new ContributorsView({
				el: '#test-div',
				model: contributorsModel
			});

			expect(fetchContribTypeSpy).toHaveBeenCalled();
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
				expect(setElContribTabSpy).not.toHaveBeenCalled();
				expect(renderContribTabSpy).not.toHaveBeenCalled();

				testView.contributorTypeCollection = new Backbone.Collection([{id : 1, text : 'Type1'}, {id : 2, text : 'Type2'}]);
				fetchContribTypeDeferred.resolve();
				expect(BaseView.prototype.render).toHaveBeenCalled();
				expect(setElContribTabSpy.calls.count()).toBe(4);// Called twice for each child view
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
				expect(removeContribTabSpy.calls.count()).toBe(2);
			});
		})
	});
});
