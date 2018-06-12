/* jslint browser: true */
/* global define */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */

define([
	'squire',
	'jquery',
	'select2',
	'underscore',
	'backbone',
	'models/ContributorModel'
], function(Squire, $, select2, _, Backbone, ContributorModel) {
	"use strict";

	describe('views/ManageContributorsView', function() {
		var testView, ManageContributorsView;
		var $testDiv;
		var testModel, testRouter;

		var setElementAlertViewSpy, showSuccessAlertSpy, showDangerAlertSpy, closeAlertSpy, removeAlertViewSpy;
		var setElementPersonViewSpy, renderPersonViewSpy, removePersonViewSpy;
		var setElementCorpViewSpy, renderCorpViewSpy, removeCorpViewSpy;

		var fetchModelDeferred, saveModelDeferred;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new ContributorModel();
			fetchModelDeferred = $.Deferred();
			saveModelDeferred = $.Deferred();
			spyOn(testModel, 'fetch').and.returnValue(fetchModelDeferred.promise());
			spyOn(testModel, 'save').and.returnValue(saveModelDeferred.promise());

			setElementAlertViewSpy = jasmine.createSpy('setElementAlertViewSpy');
			showSuccessAlertSpy = jasmine.createSpy('showSuccessAlertSpy');
			showDangerAlertSpy = jasmine.createSpy('showDangerAlertSpy');
			closeAlertSpy = jasmine.createSpy('closeAlertSpy');
			removeAlertViewSpy = jasmine.createSpy('removeAlertViewSpy');

			setElementPersonViewSpy = jasmine.createSpy('setElementPersonViewSpy');
			renderPersonViewSpy = jasmine.createSpy('renderPersonViewSpy');
			removePersonViewSpy = jasmine.createSpy('removePersonViewSpy');

			setElementCorpViewSpy = jasmine.createSpy('setElementCorpViewSpy');
			renderCorpViewSpy = jasmine.createSpy('renderCorpViewSpy');
			removeCorpViewSpy = jasmine.createSpy('removeCorpViewSpy');

			testRouter = jasmine.createSpyObj('routerSpy', ['navigate']);

			injector = new Squire();
			injector.mock('jquery', $);
			injector.mock('views/AlertView', Backbone.View.extend({
				setElement : setElementAlertViewSpy,
				showSuccessAlert : showSuccessAlertSpy,
				showDangerAlert : showDangerAlertSpy,
				closeAlert : closeAlertSpy,
				remove : removeAlertViewSpy
			}));
			injector.mock('views/EditPersonView', Backbone.View.extend({
				setElement : setElementPersonViewSpy,
				render : renderPersonViewSpy,
				remove : removePersonViewSpy
			}));
			injector.mock('views/EditCorporationView', Backbone.View.extend({
				setElement : setElementCorpViewSpy,
				render : renderCorpViewSpy,
				remove : removeCorpViewSpy
			}));

			injector.require(['views/ManageContributorsView'], function(View) {
				ManageContributorsView = View;

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		it('Expects that the alertView is created at initialization', function() {
			testView = new ManageContributorsView({
				el : $testDiv,
				model : testModel,
				router : testRouter
			});

			expect(setElementAlertViewSpy).toHaveBeenCalled();
		});

		it('Expects that the model fetch is not called on a new model', function() {
			testView = new ManageContributorsView({
				el : $testDiv,
				model : testModel,
				router : testRouter
			});

			expect(testModel.fetch).not.toHaveBeenCalled();
		});

		it('Expects that if the id is set in the model, the model is fetched', function() {
			testModel.set('contributorId', 1);
			testView = new ManageContributorsView({
				el : $testDiv,
				model : testModel,
				router : testRouter
			});

			expect(testModel.fetch).toHaveBeenCalled();
		});

		describe('Tests for render for a new contributor', function() {
			beforeEach(function() {
				testView = new ManageContributorsView({
					el : $testDiv,
					model : testModel,
					router : testRouter
				});

				spyOn($.fn, 'select2');
				testView.render();
			});

			it('Expects the alert view\'s setElement to be called', function() {
				expect(setElementAlertViewSpy.calls.count()).toBe(2);
			});

			it('Expects the select2s to pick contributor type, person, and corporation to be initialized', function() {
				var select2Args = $.fn.select2.calls.all();
				expect($.fn.select2.calls.count()).toBe(3);
				expect(_.find(select2Args, function(arg) {
					return arg.object.hasClass('contributor-type-select');
				})).toBeDefined();
				expect(_.find(select2Args, function(arg) {
					return arg.object.parent().hasClass('person-select-div');
				})).toBeDefined();expect(_.find(select2Args, function(arg) {
					return arg.object.parent().hasClass('corporation-select-div');
				})).toBeDefined();
			});
		});

		describe('Tests for render for an existing person contributor', function() {
			beforeEach(function() {
				testModel.set({
					contributorId: 1,
					corporation: false
				});
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router : testRouter
				});
				testView.render();
			});

			it('Expects that the edit person view is not created and rendered until the model has been fetched', function() {
				expect(setElementPersonViewSpy).not.toHaveBeenCalled();
			});

			it('Expects a failed fetch to show an alert message', function() {
				fetchModelDeferred.reject({
					status : 500,
					statusText : 'Internal Server Error'
				});

				expect(showDangerAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the fetch is successful an edit person view is created, the select contributor container is hidden and the edit buttons are visible', function() {
				fetchModelDeferred.resolve();

				expect(setElementPersonViewSpy).toHaveBeenCalled();
				expect(renderPersonViewSpy).toHaveBeenCalled();
				expect(setElementCorpViewSpy).not.toHaveBeenCalled();
				expect(renderCorpViewSpy).not.toHaveBeenCalled();
				expect($testDiv.find('.select-contributor-container').is(':visible')).toBe(false);
				expect($testDiv.find('.contributor-button-container').is(':visible')).toBe(true);
			});
		});

		describe('Tests for render for an existing corporation contributor', function() {
			beforeEach(function() {
				testModel.set({
					contributorId: 1,
					corporation: true
				});
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router : testRouter
				});
				testView.render();
			});

			it('Expects that the edit corporation view is not created and rendered until the model has been fetched', function() {
				expect(setElementCorpViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that if the fetch is successful an edit person view is created, the select contributor container is hidden and the edit buttons are visible', function() {
				fetchModelDeferred.resolve();

				expect(setElementPersonViewSpy).not.toHaveBeenCalled();
				expect(renderPersonViewSpy).not.toHaveBeenCalled();
				expect(setElementCorpViewSpy).toHaveBeenCalled();
				expect(renderCorpViewSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for remove', function() {
			it('Expects that the alertView is removed', function() {
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router : testRouter
				});
				testView.render();
				testView.remove();

				expect(removeAlertViewSpy).toHaveBeenCalled();
				expect(removePersonViewSpy).not.toHaveBeenCalled();
				expect(removeCorpViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that the edit person view to be removed if editing a person', function() {
				testModel.set({
					contributorId: 1,
					corporation: false
				});
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router : testRouter
				});
				fetchModelDeferred.resolve();
				testView.render();
				testView.remove();

				expect(removeAlertViewSpy).toHaveBeenCalled();
				expect(removePersonViewSpy).toHaveBeenCalled();
				expect(removeCorpViewSpy).not.toHaveBeenCalled();
			});

			it('Expects that the edit corporation view to be removed if editing a corporation', function() {
				testModel.set({
					contributorId: 1,
					corporation: true
				});
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router : testRouter
				});
				fetchModelDeferred.resolve();
				testView.render();
				testView.remove();

				expect(removeAlertViewSpy).toHaveBeenCalled();
				expect(removePersonViewSpy).not.toHaveBeenCalled();
				expect(removeCorpViewSpy).toHaveBeenCalled();
			});
		});

		describe('DOM event handlers', function() {
			var $errorDiv;
			var $selectContribToEditDiv;
			var $contributorTypeSelect, $personSelect, $corporationSelect;
			var $createBtn, $saveBtn, $cancelBtn, $createNewBtn;
			beforeEach(function () {
				testView = new ManageContributorsView({
					el: $testDiv,
					model: testModel,
					router: testRouter
				});
				testView.render();
				$errorDiv = $testDiv.find('.validation-errors');
				$selectContribToEditDiv = $testDiv.find('.select-create-or-edit-container');
				$contributorTypeSelect = $testDiv.find('.contributor-type-select');
				$personSelect = $testDiv.find('.person-select-div');
				$corporationSelect = $testDiv.find('.corporation-select-div');
				$createBtn = $testDiv.find('.create-btn');
				$saveBtn = $testDiv.find('.save-btn');
				$cancelBtn = $testDiv.find('.cancel-btn');
				$createNewBtn = $testDiv.find('.create-new-btn');
			});

			it('Expects that clicking the back to search button navigates back to the search page', function () {
				$testDiv.find('.back-to-search-btn').trigger('click');
				expect(testRouter.navigate).toHaveBeenCalled();
				expect(testRouter.navigate.calls.argsFor(0)[0]).toEqual('');
			});

			it('Expects that if a person contributor is selected then the person select is visible', function () {
				$contributorTypeSelect.val('person').trigger('select2:select');

				expect($selectContribToEditDiv.is(':visible')).toBe(true);
				expect($personSelect.is(':visible')).toBe(true);
				expect($corporationSelect.is(':visible')).toBe(false);
			});

			it('Expects that if a corporation contributor is selected then the corporation select is visible', function () {
				$contributorTypeSelect.val('corporation').trigger('select2:select');

				expect($selectContribToEditDiv.is(':visible')).toBe(true);
				expect($personSelect.is(':visible')).toBe(false);
				expect($corporationSelect.is(':visible')).toBe(true);
			});

			it('Expects that clicking the Create button creates an person edit view when selected and sets the model\'s corporation property', function () {
				$contributorTypeSelect.val('person').trigger('select2:select');
				$createBtn.trigger('click');

				expect(renderPersonViewSpy).toHaveBeenCalled();
				expect(renderCorpViewSpy).not.toHaveBeenCalled();
				expect(testModel.get('corporation')).toBe(false);
			});

			it('Expects that clicking the Create button creates an corporation edit view when selected and sets the model\'s corporation property', function () {
				$contributorTypeSelect.val('corporation').trigger('select2:select');
				$createBtn.trigger('click');

				expect(renderPersonViewSpy).not.toHaveBeenCalled();
				expect(renderCorpViewSpy).toHaveBeenCalled();
				expect(testModel.get('corporation')).toBe(true);
			});

			describe('Tests for selecting a contributor to edit', function() {
				/* Its difficult to simulate the select2 since it is created dynamically. We will call
				 * the event handler directly
				 */
				var ev;
				beforeEach(function() {
					ev = {
						currentTarget : {
							value : '1234'
						}
					};
				});
				it('Expects that selecting a person fetches that person', function() {
					$contributorTypeSelect.val('person').trigger('select2:select');
					testView.editContributor(ev);

					expect(testModel.get('corporation')).toBe(false);
					expect(testModel.fetch).toHaveBeenCalled();
				});

				it('Expects that if the fetch fails an error message is shown', function() {
					$contributorTypeSelect.val('person').trigger('select2:select');
					testView.editContributor(ev);
					fetchModelDeferred.reject({
						status : 500,
						statusText : 'Internal server error'
					});

					expect(showDangerAlertSpy).toHaveBeenCalled();
				});

				it('Expects that a successfully fetch creates a person view and navigates to that contributorId', function() {
					$contributorTypeSelect.val('person').trigger('select2:select');
					testView.editContributor(ev);
					testModel.set('contributorId', 1234);
					fetchModelDeferred.resolve();

					expect(renderPersonViewSpy).toHaveBeenCalled();
					expect(renderCorpViewSpy).not.toHaveBeenCalled();
					expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
				});

				it('Expects that selecting a corporation fetches that corproation', function() {
					$contributorTypeSelect.val('corporation').trigger('select2:select');
					testView.editContributor(ev);

					expect(testModel.get('corporation')).toBe(true);
					expect(testModel.fetch).toHaveBeenCalled();
				});

				it('Expects that a successfully fetch creates a corporation view and navigates to that contributorId', function() {
					$contributorTypeSelect.val('corporation').trigger('select2:select');
					testView.editContributor(ev);
					testModel.set('contributorId', 1234);
					fetchModelDeferred.resolve();

					expect(renderPersonViewSpy).not.toHaveBeenCalled();
					expect(renderCorpViewSpy).toHaveBeenCalled();
					expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
				});
			});

			it('Expects that clicking the save button clears the error div and saves the model', function() {
				$errorDiv.html('Old errors');
				$saveBtn.trigger('click');

				expect($errorDiv.html()).toEqual('');
				expect(testModel.save).toHaveBeenCalled();
			});

			it('Expects that clicking the save button and then the save fails will show a danger alert', function() {
				$saveBtn.trigger('click');
				saveModelDeferred.reject({
					status : 400,
					statusText : 'Invalid data',
					responseJSON : {validationErrors: {given : 'Needs to be non null'}}
				});

				expect(showDangerAlertSpy).toHaveBeenCalled();
				expect($errorDiv.html()).toContain('{"given":"Needs to be non null"}');
			});

			it('Expects that clicking save followed by a successful save updates the route', function() {
				$saveBtn.trigger('click');
				testModel.set('contributorId', 1234);
				saveModelDeferred.resolve();

				expect(showSuccessAlertSpy).toHaveBeenCalled();
				expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
			});

			it('Expects that clicking the cancel button clears the model but doesn\'t fetch is the model is new', function() {
				spyOn(testModel, 'clear').and.callThrough();
				$cancelBtn.trigger('click');

				expect(testModel.clear).toHaveBeenCalled();
				expect(testModel.fetch).not.toHaveBeenCalled();
			});

			it('Expects that clicking on the cancel button when the model is not new refetches the model', function() {
				testModel.set('contributorId',  1234);
				$cancelBtn.trigger('click');

				expect(testModel.fetch).toHaveBeenCalled();
			});

			it('Expects that if the fetch fails after clicking on the cancel button, the danger alert is shown', function() {
				testModel.set('contributorId',  1234);
				$cancelBtn.trigger('click');
				fetchModelDeferred.reject();
				expect(showDangerAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the create a new contributor button is clicked, the model is cleared, the select contributor container shown', function() {
				spyOn(testModel, 'clear').and.callThrough();
				$contributorTypeSelect.val('corporation').trigger('select2:select');
				testView.editContributor({
					currentTarget : {value : 1234}
				});
				fetchModelDeferred.resolve();
				$createNewBtn.trigger('click');

				expect(testModel.clear).toHaveBeenCalled();
				expect(removeCorpViewSpy).toHaveBeenCalled();
				expect($testDiv.find('.select-contributor-container').is(':visible')).toBe(true);
				expect($testDiv.find('.contributor-button-container').is(':visible')).toBe(false);
			});
		});
	});
});
