/* jslint browser: true */

define([
	'squire',
	'jquery',
	'views/BaseView',
	'models/PublicationModel'
], function(Squire, $, BaseView, PublicationModel) {
	"use strict";

	describe('PublicationView', function(){
		var PublicationView;
		var testView;

		var setElAlertSpy, renderAlertSpy, removeAlertSpy, dangerAlertSpy, successAlertSpy;
		var setElDialogSpy, renderDialogSpy, removeDialogSpy, showDialogSpy;
		var setElBibliodataSpy, renderBibliodataSpy, removeBibliodataSpy, findElBibliodataSpy;
		var setElLinksSpy, renderLinksSpy, removeLinksSpy, findElLinksSpy;

		var pubModel;
		var opDeferred;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');

			opDeferred = $.Deferred();

			pubModel = new PublicationModel();
			spyOn(pubModel, 'fetch').and.returnValue(opDeferred.promise());
			spyOn(pubModel, 'save').and.returnValue(opDeferred.promise());
			spyOn(pubModel, 'release').and.returnValue(opDeferred.promise());
			spyOn(pubModel, 'publish').and.returnValue(opDeferred.promise());
			spyOn(pubModel, 'destroy').and.returnValue(opDeferred.promise());

			setElAlertSpy = jasmine.createSpy('setElAlertSpy');
			renderAlertSpy = jasmine.createSpy('renderAlertSpy');
			removeAlertSpy = jasmine.createSpy('removeAlertSpy');
			dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');
			successAlertSpy = jasmine.createSpy('successAlertSpy');

			setElDialogSpy = jasmine.createSpy('setElDialogSpy');
			renderDialogSpy = jasmine.createSpy('renderDialogSpy');
			removeDialogSpy = jasmine.createSpy('removeDialogSpy');
			showDialogSpy = jasmine.createSpy('showDialogSpy');

			setElBibliodataSpy = jasmine.createSpy('setElBibliodataSpy');
			renderBibliodataSpy = jasmine.createSpy('renderBibliodataSpy');
			removeBibliodataSpy = jasmine.createSpy('removeBibliodataSpy');
			findElBibliodataSpy = jasmine.createSpy('findElBibliodataSpy').and.returnValue({
				tooltip : jasmine.createSpy()
			});

			setElLinksSpy = jasmine.createSpy('setElBibliodataSpy');
			renderLinksSpy = jasmine.createSpy('renderBibliodataSpy');
			removeLinksSpy = jasmine.createSpy('removeBibliodataSpy');
			findElLinksSpy = jasmine.createSpy('findElBibliodataSpy').and.returnValue({
				tooltip : jasmine.createSpy()
			});

			var injector = new Squire();
			injector.mock('views/AlertView', BaseView.extend({
				setElement : setElAlertSpy,
				render : renderAlertSpy,
				remove : removeAlertSpy,
				showDangerAlert : dangerAlertSpy,
				showSuccessAlert : successAlertSpy
			}));
			injector.mock('views/ConfirmationDialogView', BaseView.extend({
				setElement : setElDialogSpy.and.returnValue({
					render : renderDialogSpy
				}),
				render : renderDialogSpy,
				remove : removeDialogSpy,
				show : showDialogSpy
			}));
			injector.mock('views/BibliodataView', BaseView.extend({
				setElement : setElBibliodataSpy.and.returnValue({
					render : renderBibliodataSpy
				}),
				render : renderBibliodataSpy,
				remove : removeBibliodataSpy,
				$ : findElBibliodataSpy
			}));
			injector.mock('views/LinksView', BaseView.extend({
				setElement : setElLinksSpy.and.returnValue({
					render : renderLinksSpy
				}),
				render : renderLinksSpy,
				remove : removeLinksSpy,
				$ : findElLinksSpy
			}));

			injector.require(['views/PublicationView'], function(view){
				PublicationView = view;
				done();
			});
		});

		afterEach(function() {
			$('#test-div').remove();
		});

		it('Expects that when creating a view with a new model, the model\'s fetch is not called', function() {
			testView = new PublicationView({
				model : pubModel,
				el : '#test-div'
			});
			expect(pubModel.fetch).not.toHaveBeenCalled();
		});

		it('Expects that when creating a view with a model, the model\'s fetch is called', function() {
			pubModel.set('id', 1234);
			testView = new PublicationView({
				model : pubModel,
				el : '#test-div'
			});
			expect(pubModel.fetch).toHaveBeenCalled();
		});

		describe('Tests for render', function() {
			it('Expects the confirmationDialogView to be rendered and the alertView to have it\'s element set', function() {
				pubModel.set('id', 1234);
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();

				expect(setElAlertSpy.calls.count()).toBe(2);
				expect(renderAlertSpy).not.toHaveBeenCalled();
				expect(setElDialogSpy.calls.count()).toBe(2);
				expect(renderDialogSpy).toHaveBeenCalled();
			});

			it('Expects the child tab views to not be rendered until a successful fetch occurs', function() {
				pubModel.set('id', 1234);
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();

				expect(setElBibliodataSpy.calls.count()).toBe(1);
				expect(renderBibliodataSpy).not.toHaveBeenCalled();
				expect(setElLinksSpy.calls.count()).toBe(1);
				expect(renderLinksSpy).not.toHaveBeenCalled();

				opDeferred.resolve();

				expect(setElBibliodataSpy.calls.count()).toBe(2);
				expect(renderBibliodataSpy).toHaveBeenCalled();
				expect(setElLinksSpy.calls.count()).toBe(2);
				expect(renderLinksSpy).toHaveBeenCalled();
			});

			it('Expects a successful fetch will not show an alert', function() {
				pubModel.set('id', 1234);
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();
				opDeferred.resolve();
				expect(dangerAlertSpy).not.toHaveBeenCalled();
			});

			it('Expects a failed fetch to show an alert but not to show the tab views', function() {
				pubModel.set('id', 1234);
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();
				opDeferred.reject({statusText : 'Error text'});
				expect(dangerAlertSpy).toHaveBeenCalled();
				expect(renderBibliodataSpy).not.toHaveBeenCalled();
				expect(renderLinksSpy).not.toHaveBeenCalled();
			});

			it('Expects a new pub to not show an alert', function() {
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();
				expect(dangerAlertSpy).not.toHaveBeenCalled();
			});
		});

		describe('Tests for remove', function() {
			it('Expects remove to call the child view remove functions', function() {
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				});
				testView.remove();
				expect(removeAlertSpy).toHaveBeenCalled();
				expect(removeDialogSpy).toHaveBeenCalled();
				expect(removeBibliodataSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for updating the model id', function() {
			beforeEach(function() {
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				}).render();
			});

			it('Expects the preview div to be shown if the id is non null and hidden if it is null', function() {
				expect($('#pub-preview-div').is(':visible')).toBe(false);

				pubModel.set('id', 1234);
				expect($('#pub-preview-div').is(':visible')).toBe(true);
				expect($('#pub-preview-div a').attr('href')).toMatch('1234');

				pubModel.set('id', '');
			});
		});

		describe('Tests for releasing a pub', function() {
			beforeEach(function() {
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				});
				spyOn(testView, 'returnToSearch');
			});

			it('Expects that if release succeeds the route is changed to search', function() {
				testView.releasePub();
				expect(pubModel.release).toHaveBeenCalled();
				expect(testView.returnToSearch).not.toHaveBeenCalled();
				opDeferred.resolve();
				expect(testView.returnToSearch).toHaveBeenCalled();
			});

			it('Expects that if release fails an alert is shown', function() {
				testView.releasePub();
				expect(dangerAlertSpy).not.toHaveBeenCalled();
				opDeferred.reject('Error message');
				expect(dangerAlertSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for saving a pub', function() {
			beforeEach(function() {
				pubModel.set('id', 1234);
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				});
			});

			it('Expects that if the save succeeds a success alert is shown', function() {
				testView.savePub();
				expect(successAlertSpy).not.toHaveBeenCalled();
				opDeferred.resolve();
				expect(successAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the save contains validation errors, the model is updated with the errors and a danger alert is shown', function() {
				testView.savePub();
				expect(dangerAlertSpy).not.toHaveBeenCalled();
				opDeferred.reject({
					responseJSON: {
						validationErrors: ['One error']
					}
				});
				expect(pubModel.get('validationErrors')).toEqual(['One error']);
				expect(dangerAlertSpy).toHaveBeenCalled();
			});

			it('Expects that if the save fails without validation errors, the model is not updated and the danger alert is shown', function() {
				testView.savePub();
				expect(dangerAlertSpy).not.toHaveBeenCalled();
				opDeferred.reject({}, 'error', 'Server error');
				expect(pubModel.has('validationErrors')).toBe(false);
				expect(dangerAlertSpy).toHaveBeenCalled();
			});
		});

		describe('Tests for publishing a pub', function() {
			var savePubDeferred;

			beforeEach(function() {
				savePubDeferred = $.Deferred();
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				});

				spyOn(testView, 'savePub').and.returnValue(savePubDeferred.promise());
				spyOn(testView, 'returnToSearch');
			});

			it('Expects that a call to publishPub first calls savePub', function() {
				testView.publishPub();
				expect(testView.savePub).toHaveBeenCalled();
			});

			it('Expects a failed call to save to not call the confirmation dialog or the model\'s publish', function() {
				testView.publishPub();
				savePubDeferred.reject('an error');
				expect(showDialogSpy).not.toHaveBeenCalled();
			});

			it('Expects a successful call to save to call the confirmation dialog', function() {
				testView.publishPub();
				savePubDeferred.resolve();
				expect(showDialogSpy).toHaveBeenCalled();
			});

			describe('Tests for publishing a pub where the save has already worked', function() {
				beforeEach(function () {
					var actionCallback;
					testView.publishPub();
					savePubDeferred.resolve();

					actionCallback = showDialogSpy.calls.argsFor(0)[1];
					//This mocks what would happen if the confirmation dialog is confirmed.
					actionCallback();
				});


				it('Expects the confirmation dialog\'s action procedure to call the model\'s publish', function () {
					expect(pubModel.publish).toHaveBeenCalled();
				});

				it('Expects that if publish is successful return to the search page', function () {
					opDeferred.resolve();
					expect(testView.returnToSearch).toHaveBeenCalled();
				});

				it('Expects that if publish fails, the danger alert is shown', function() {
					opDeferred.reject('Has error');
					expect(dangerAlertSpy).toHaveBeenCalled();
				})
			});
		});

		describe('Tests for deletePub', function() {

			beforeEach(function() {
				testView = new PublicationView({
					model : pubModel,
					el : '#test-div'
				});
				spyOn(testView, 'returnToSearch');
			});

			it('Expects the view to return to the search page if the publication is new', function() {
				testView.deletePub();
				expect(testView.returnToSearch).toHaveBeenCalled();
			});

			it('Expects the confirmation dialog to be shown if the publication is not new', function() {
				pubModel.set('id', 1234);
				testView.deletePub();
				expect(showDialogSpy).toHaveBeenCalled();
			});

			it('Expects the action callback to delete the publication', function() {
				var actionCallback;
				pubModel.set('id', 1234);
				testView.deletePub();
				actionCallback = showDialogSpy.calls.argsFor(0)[1];
				// This mocks what would happen if the confirmation dialog is confirmed.
				actionCallback();
				expect(pubModel.destroy).toHaveBeenCalled();
			});

			it('Expects a successful delete to return to the search page', function() {
				var actionCallback;
				pubModel.set('id', 1234);
				testView.deletePub();
				actionCallback = showDialogSpy.calls.argsFor(0)[1];
				// This mocks what would happen if the confirmation dialog is confirmed.
				actionCallback();

				opDeferred.resolve();
				expect(testView.returnToSearch).toHaveBeenCalled();
			});

			it('Expects a failed delete to show the danger alert', function() {
				var actionCallback;
				pubModel.set('id', 1234);
				testView.deletePub();
				actionCallback = showDialogSpy.calls.argsFor(0)[1];
				// This mocks what would happen if the confirmation dialog is confirmed.
				actionCallback();

				opDeferred.	reject({
					statusText : 'Delete error'
				});

				expect(dangerAlertSpy).toHaveBeenCalled();
			});
		});
	});
});
