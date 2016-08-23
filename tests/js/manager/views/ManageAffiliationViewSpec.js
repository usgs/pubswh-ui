/* jslint browser: true */
/* global define */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn, sinon */

define([
	'jquery',
	'models/AffiliationModel',
	'utils/DynamicSelect2',
	'views/BaseView',
	'views/ManageAffiliationView'
], function($, AffiliationModel, DynamicSelect2, BaseView, ManageAffiliationView) {
	"use strict";

	fdescribe('views/ManageAffiliationView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var testRouter;
		var fakeServer;

		var COST_CENTER_RESP = [200, {"Content-type" : "application/json"},
			'[{"id":10,"text":"California Water Science Center","active":true},' +
			'{"id":11,"text":"Wisconsin Water Science Center","active":true},' +
			'{"id":12,"text":"National Earthquake Information Center","active":true}]'];

		var OUTSIDE_RESP = [200, {"Content-type" : "application/json"},
			'[{"id":40,"text":"Super Secret Police"},' +
			'{"id":41,"text":"Pokemon League"},' +
			'{"id":42,"text":"Tufted Titmouse"}]'];

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>')
			$testDiv = $('#test-div');

			fakeServer = sinon.fakeServer.create();

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'render').and.callThrough();

			testModel = new AffiliationModel();
			testRouter = jasmine.createSpyObj('testRouterSpy', ['navigate']);
			testView = new ManageAffiliationView({
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

		describe('Tests for render', function() {

			beforeEach(function() {
				spyOn($.fn, 'select2').and.callThrough();
				fakeServer.respondWith("GET", "/costcenters", COST_CENTER_RESP);
				fakeServer.respondWith("GET", "/outsideaffiliates", OUTSIDE_RESP);
			});

			afterEach(function() {
				fakeServer.restore();
			});

			it('Expects that BaseView render is called', function() {
				testView.render();
				expect(BaseView.prototype.render).toHaveBeenCalled();
			});

			it('Expects a drop with affiliation types is populated', function() {
				testView.render();
				var select2Calls = $.fn.select2.calls.count();
				expect(select2Calls).toBe(1);
			});

			it('Expects a select2 dropdown called with expected data', function() {
				var affiliationTypeSelect;
				testView.render();
				affiliationTypeSelect = $('.edit-affiliation-type-input');
				var expectedData = {data : [{id: ''},
					{id: 1, text: 'Cost Center'},
					{id: 2, text: 'Outside Affiliation'}]
				};
				expect(affiliationTypeSelect.select2).toHaveBeenCalledWith(expectedData, {theme : 'bootstrap'});
			});

			it('Expects that the affiliation select2 field is disabled upon load', function() {
				testView.render();
				expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(true);
			});

			it('Expects that the initial selection div is visible and the edit div is hidden', function() {
				testView.render();
				expect($('.create-or-edit-div').hasClass('show')).toBe(true);
				expect($('.edit-div').hasClass('hidden')).toBe(true);
			});

			it('Expects that the affiliationIsCostCenter is set to null initially', function() {
				testView.render();
				expect(testView.affiliationIsCostCenter).toBe(null);
			});
		});

		describe('Tests for DOM event handlers', function() {

			beforeEach(function() {
				spyOn(DynamicSelect2, 'getSelectOptions').and.callThrough();
				testView.render();
			});

			it('Expects that if an affiliation type is selected, the affiliation edit select will be enabled', function() {
				$testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
				expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(false);
			});

			it('Expects that the cost center lookup is true used if the Cost Center type is selected', function() {
				$testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
				expect(DynamicSelect2.getSelectOptions).toHaveBeenCalledWith({lookupType : 'costcenters', activeSubgroup : true});
			});

			it('Expects that affiliationIsCostCenter is true if a user selects the cost center type', function() {
				$testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
				expect(testView.affiliationIsCostCenter).toBe(true);
			});

			it('Expects that affiliationIsCostCenter is false if a user selects the outside affiliation type', function() {
				$testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
				expect(testView.affiliationIsCostCenter).toBe(false);
			});

			it('Expects that the outside affiliates lookup is used if Outside Affiliates type is selected', function() {
				$testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
				expect(DynamicSelect2.getSelectOptions).toHaveBeenCalledWith({lookupType : 'outsideaffiliates', activeSubgroup : true});
			});

			describe('Tests for editing an affiliation', function() {

				beforeEach(function() {
					$testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
					fakeServer.respondsWith('/costcenters/', COST_CENTER_RESP);
					fakeServer.respond();
					var $affiliationInput = $testDiv.find('#edit-affiliation-input');
					$affiliationInput.html('<option value="10">California Water Science Center</option>');
					$affiliationInput.val('10').trigger('select2:select');
				});

				it('Expects that the affiliation submission form is shown when an affiliation is selected', function () {
					var $editDiv = $testDiv.find('.edit-div');
					console.log($editDiv);
					expect($editDiv.hasClass('show')).toBe(true);
				});
			});
		});

		xdescribe('Tests for editing an existing affiliation', function() {

			beforeEach(function() {
				testView.render();
			});

			xit('Expects that Cost Center input is selected and hidden if editing a Cost Center affiliation', function() {
				$testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
				$testDiv.find('#edit-affiliation-input').select2('open');
				fakeServer.respondWith(/costcenters/, COST_CENTER_RESP);
				fakeServer.respond();
				console.log(fakeServer.requests);
				//$testDiv.find('#edit-affiliation-input').val('10').trigger('select2:select');
			});

			it('Expects the edit form to ')

			xit('Expects that Cost Center input is not selected and hidden if editing an Outside affiliation', function() {
				$testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
			});

		});
	});
});