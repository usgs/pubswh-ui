/* jslint browser: true */
/* global define */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn, sinon */

define([
	'jquery',
	'underscore',
	'models/SeriesTitleModel',
	'views/BaseView',
	'views/EditSeriesTitleView'
], function($, _, SeriesTitleModel, BaseView, EditSeriesTitleView) {
	"use strict";

	describe('views/EditSeriesTitleView', function () {
		var testView;
		var $testDiv;
		var testModel;
		var testRouter;
		var fakeServer;

		var PUB_SUBTYPE_RESPONSE = [200, {"Content-type": 'application/json'}, '[{"id":1,"text":"Federal Government Series"},' +
			'{"id":2,"text":"State/Local Government Series"},'+
			'{"id":3,"text":"Organization Series"}]'];


		beforeEach(function () {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			fakeServer = sinon.fakeServer.create();

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'render').and.callThrough();

			testModel = new SeriesTitleModel();
			testRouter = jasmine.createSpyObj('testRouterSpy', ['navigate']);
			testView = new EditSeriesTitleView({
				el : $testDiv,
				model : testModel,
				router : testRouter
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
			fakeServer.restore();
		});

		it('Expects BaseView initialize to be called', function() {
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that the alertView has been created', function() {
			expect(testView.alertView).toBeDefined();
		});

		it('Expects that the publication subtype lookup is fetched', function() {
			expect(fakeServer.requests.length).toBe(1);
			expect(fakeServer.requests[0].url).toContain('publicationsubtyp');
		});

		describe('Tests for render', function() {
			
			beforeEach(function() {
				spyOn($.fn, 'select2').and.callThrough();
				fakeServer.respondWith(/publicationsubtypes/, PUB_SUBTYPE_RESPONSE);
			});
			
			it('Expects that BaseView render is called', function() {
				testView.render();

				expect(BaseView.prototype.render).toHaveBeenCalled();
			});
			
			it('Expects that the series title select is initialized', function() {
				var mostRecent;
				testView.render();

				expect($.fn.select2.calls.count()).toBe(1);
				mostRecent = $.fn.select2.calls.mostRecent();
				expect(mostRecent.object.attr('id')).toEqual('edit-series-title-input');
			});

			it('Expects that the publication subtype select menus are not initialized until the publication subtypes have been fetched', function() {
				var allCalls;
				testView.render();
				$.fn.select2.calls.reset();
				fakeServer.respond();

				expect($.fn.select2.calls.count()).toBe(2);
				allCalls = $.fn.select2.calls.all();
				expect(_.find(allCalls, function(c) {
					return c.object.attr('id') === 'edit-pub-subtype-input';
				})).toBeDefined();
				expect(_.find(allCalls, function(c) {
					return c.object.attr('id') === 'pub-subtype-input';
				})).toBeDefined();
			});

			it('Expects that if render is called when the model is new, then the initial selection div is visible and the edit div is hidden', function() {
				testView.render();
				
				expect($('.create-or-edit-div').hasClass('show')).toBe(true);
				expect($('.edit-div').hasClass('hidden')).toBe(true);
			});

			it('Expects that if render is call when the model has data, then the initial selection div is hidden and the edit div is visible', function() {
				testModel.set({
					id : 5000,
					active : true,
					text : 'The Best Turtle Research Journal',
					publicationSubtype : {id : 1}
				});
				testView.render();

				expect($('.create-or-edit-div').hasClass('hidden')).toBe(true);
				expect($('.edit-div').hasClass('show')).toBe(true);
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView.render();
			});
			it('Expects that BaseView remove is called', function() {
				spyOn(BaseView.prototype, 'remove').and.callThrough();
				testView.remove();

				expect(BaseView.prototype.remove).toHaveBeenCalled();
			});

			it('Expects that the alert view is also removed', function() {
				spyOn(testView.alertView, 'remove');
				testView.remove();

				expect(testView.alertView.remove).toHaveBeenCalled();
			});
		});

		describe('Tests for series title model event handlers', function() {
			beforeEach(function() {
				fakeServer.respondWith(/publicationsubtypes/, PUB_SUBTYPE_RESPONSE);
				fakeServer.respond();
				testView.render();
			});

			it('Expects that if the publication subtype is changed, the edit select value is updated', function() {
				var $select = $testDiv.find('#pub-subtype-input');
				testModel.set('publicationSubtype', {id : 2});

				expect($select.val()).toEqual('2');

				testModel.set('publicationSubtype', {id : 3});

				expect($select.val()).toEqual('3');

				testModel.unset('publicationSubtype');
				expect($select.val()).toEqual('');
			});
		});

		describe('Tests for DOM event handlers', function() {
			var SERIES_LOOKUP_RESPONSE = [200, {'Content-Type' : 'application/json'},
				'[{"id":5000,"text":"The Best Turtle Research Journal"},{"id":5001,"text":"The mediocre Turtle Research Journal"}]'];

			beforeEach(function() {
				fakeServer.respondWith(/publicationsubtypes/, PUB_SUBTYPE_RESPONSE);
				fakeServer.respond();
				testView.render();
			});

			it('Expects that if the edit publication subtype select is updated to contain a value, then series title select will be enabled', function() {
				$testDiv.find('#edit-pub-subtype-input').val('2').trigger('select2:select');

				expect($testDiv.find('#edit-series-title-input').is(':disabled')).toBe(false);
			});

			describe('Tests for selected series title to edit', function() {
				var $loadingIndicator;
				beforeEach(function() {
					var $seriesTitleSelect = $testDiv.find('#edit-series-title-input');
					$loadingIndicator = $testDiv.find('.loading-indicator');

					spyOn(testModel, 'fetch').and.callThrough();
					spyOn(testView.alertView, 'showDangerAlert');
					spyOn(testView.alertView, 'closeAlert');

					$testDiv.find('#edit-pub-subtype-input').val('2').trigger('select2:select');
					$seriesTitleSelect.html('<option value="5000">The Best Turtle Research Journal</option>');
					$seriesTitleSelect.val('5000').trigger('select2:select');
				});

				it('Expects that the model id is set to 5000 and fetch is called', function() {
					expect(testModel.get('id')).toEqual('5000');
					expect(testModel.fetch).toHaveBeenCalled();
				});

				it('Expects that the loading indicator is shown and any alerts cleared', function() {
					expect($loadingIndicator.is(':visible')).toBe(true);
					expect(testView.alertView.closeAlert).toHaveBeenCalled();
				});

				it('Expects a failed fetch to show the danger alert and hide the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, [500, {"Content-Type" : "text"}, 'Internal server error']);
					fakeServer.respond();

					expect(testView.alertView.showDangerAlert).toHaveBeenCalled();
					expect($loadingIndicator.is(':visible')).toBe(false);
				});

				it('Expects a successful fetch to show the edit section, enable the delete button, update the url, and hide the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, SERIES_LOOKUP_RESPONSE);
					fakeServer.respond();

					expect($testDiv.find('.delete-btn').is(':disabled')).toBe(false);
					expect($('.create-or-edit-div').hasClass('hidden')).toBe(true);
					expect($('.edit-div').hasClass('show')).toBe(true);
					expect(testRouter.navigate).toHaveBeenCalledWith('seriesTitle/5000');
					expect($loadingIndicator.is(':visible')).toBe(false);
				});
			});

			it('Expects clicking the create series title btn shows the edit section and disables the delete button', function() {
				$testDiv.find('.create-btn').trigger('click');

				expect($('.create-or-edit-div').hasClass('hidden')).toBe(true);
				expect($('.edit-div').hasClass('show')).toBe(true);
				expect($testDiv.find('.delete-btn').is(':disabled')).toBe(true);
			});

			it('Expects that updating the series title input updates the text property in the model', function() {
				$testDiv.find('#series-title-text-input').val('New Journal Title').trigger('change');

				expect(testModel.get('text')).toEqual('New Journal Title');
			});

			it('Expects that updating the publication subtype updates the publicationSubtype property in the model', function() {
				$testDiv.find('#pub-subtype-input').val('1').trigger('select2:select');

				expect(testModel.get('publicationSubtype')).toEqual({id : '1'});
			});

			it('Expects that updating the DOI Name input updates the seriesDoiName property in the model', function() {
				$testDiv.find('#series-doi-name-input').val('This is a longer title').trigger('change');

				expect(testModel.get('seriesDoiName')).toEqual('This is a longer title');
			});

			it('Expects that updating the online ISSN input updates the onlineIssn property in the model', function() {
				$testDiv.find('#online-issn-input').val('1234').trigger('change');

				expect(testModel.get('onlineIssn')).toEqual('1234');
			});

			it('Expects that updating the print ISSN input updates the printIssn property in the model', function() {
				$testDiv.find('#print-issn-input').val('ABCD').trigger('change');

				expect(testModel.get('printIssn')).toEqual('ABCD');
			});

			it('Expects that changing the active toggle update the active property in the model', function() {
				var $activeInput = $testDiv.find('#active-input');
				$activeInput.prop('checked', false).trigger('change');

				expect(testModel.get('active')).toEqual(false);

				$activeInput.prop('checked', true).trigger('change');

				expect(testModel.get('active')).toEqual(true);
			});

			describe('Tests for clicking the save button', function() {
				var $loadingIndicator;
				var $errorsDiv;
				beforeEach(function() {
					$loadingIndicator = $testDiv.find('.loading-indicator');
					$errorsDiv = $testDiv.find('.validation-errors');

					spyOn(testView.alertView, 'showSuccessAlert');
					spyOn(testView.alertView, 'showDangerAlert');
					spyOn(testModel, 'save').and.callThrough();

					$testDiv.find('.save-btn').trigger('click');
				});

				it('Expects that the loading indicator is shown, that the error div is cleared and the model save is called', function() {
					expect($loadingIndicator.is(':visible')).toBe(true);
					expect($errorsDiv.html()).toEqual('');
					expect(testModel.save).toHaveBeenCalled();
				});

				it('Expects that a failed save shows an alert and validation errors and hides the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, [400, {'Content-Type' : 'application/json'},
						'{"validationErrors":[{"field":"publicationSubtype","message":"may not be null","level":"FATAL","value":null}]}']);
					fakeServer.respond();

					expect($loadingIndicator.is(':visible')).toBe(false);
					expect(testView.alertView.showDangerAlert).toHaveBeenCalled();
					expect($errorsDiv.html()).toContain('"field":"publicationSubtype","message":"may not be null","level":"FATAL","value":null');
				});

				it('Expects a successful save to show a success alert, enables the delete button, updates the URL and shows the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, [200, {'Content-Type' : 'application/json'},
						'{"id":5007,"text":"Marys cat journal","active":false,"publicationSubtype":{"id":4},"validationErrors":[]}']);
					fakeServer.respond();

					expect($loadingIndicator.is(':visible')).toBe(false);
					expect(testView.alertView.showSuccessAlert).toHaveBeenCalled();
					expect($testDiv.find('.delete-btn').is(':disabled')).toBe(false);
					expect(testRouter.navigate).toHaveBeenCalledWith('seriesTitle/5007');
				});
			});

			describe('Tests for clicking the reset button', function() {

				beforeEach(function() {
					testModel.set({
						id : 5007,
						text : 'Marys journal',
						active : true,
						publicationSubtype : {id : 4},
						onlineISSN : '1234'
					});
					spyOn(testView.alertView, 'showDangerAlert');
				});

				it('Expects that a successful fetch updates the display with the series title retrieved from the server', function() {
					$testDiv.find('.cancel-btn').trigger('click');
					fakeServer.respondWith(/publicationSeries/, [200, {'Content-Type' : 'application/json'},
						'{"id":5007,"text":"Marys cat journal","active":false,"publicationSubtype":{"id":4}}']);
					fakeServer.respond();

					expect(testModel.attributes).toEqual({
						id : 5007,
						text : 'Marys cat journal',
						active : false,
						publicationSubtype : {id : 4}
					});
				});

				it('Expects that an unsuccessful fetch clears the display and shows a danger alert', function() {
					$testDiv.find('.cancel-btn').trigger('click');
					fakeServer.respondWith(/publicationSeries/, [500, {'Content-Type' : 'text'}, 'Internal Server error']);
					fakeServer.respond();

					expect(testModel.attributes).toEqual({id : 5007});
					expect(testView.alertView.showDangerAlert).toHaveBeenCalled();
				});
			});

			it('Expects that when the Edit New Series button is clicked, the model is cleared and the page returns to selecting a series to edit', function() {
				var $createDiv = $testDiv.find('.create-or-edit-div');
				var $editDiv = $testDiv.find('.edit-div');
				testModel.set({
					id : 5007,
					text : 'Marys cat journal',
					active : false,
					publicationSubtype : {id : 4}
				});
				$createDiv.addClass('hidden').removeClass('show');
				$editDiv.addClass('show').removeClass('hidden');
				$testDiv.find('.create-new-btn').trigger('click');

				expect(testModel.attributes).toEqual({});
				expect(testRouter.navigate).toHaveBeenCalledWith('seriesTitle');
				expect($createDiv.hasClass('show')).toBe(true);
				expect($editDiv.hasClass('hidden')).toBe(true);
			});

			describe('Tests for the delete button', function() {
				var $loadingIndicator, $createDiv, $editDiv;
				
				beforeEach(function() {
					$loadingIndicator = $testDiv.find('.loading-indicator');
					$createDiv = $testDiv.find('.create-or-edit-div');
					$editDiv = $testDiv.find('.edit-div');

					spyOn(testView.alertView, 'showSuccessAlert');
					spyOn(testView.alertView, 'showDangerAlert');

					testModel.set({
						id : 5007,
						text : 'Marys cat journal',
						active : false,
						publicationSubtype : {id : 4}
					});

					$testDiv.find('.delete-ok-btn').trigger('click');
				});

				it('Expects that the loading indicator is visible', function() {
					expect($loadingIndicator.is(':visible')).toBe(true);
				});

				it('Expects that a failed response shows a danger alert and hides the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, [500, {'Content-Type' : 'text'}, 'Internal Server error']);
					fakeServer.respond();

					expect($loadingIndicator.is(':visible')).toBe(false);
					expect(testView.alertView.showDangerAlert).toHaveBeenCalled();
				});

				it('Expects that successful response hides the edit section, shows a success alert, updates the navigation, and hides the loading indicator', function() {
					fakeServer.respondWith(/publicationSeries/, [200, {'Content-Type' : 'application/json'}, '{}']);
					fakeServer.respond();

					expect($loadingIndicator.is(':visible')).toBe(false);
					expect(testView.alertView.showSuccessAlert).toHaveBeenCalled();
					expect(testRouter.navigate).toHaveBeenCalledWith('seriesTitle');
					expect($testDiv.find('.create-or-edit-div').hasClass('show')).toBe(true);
					expect($testDiv.find('.edit-div').hasClass('hidden')).toBe(true);
				});
			});
		});
	});
});

