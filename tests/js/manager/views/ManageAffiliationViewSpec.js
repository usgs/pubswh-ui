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

	describe('views/ManageAffiliationView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var testRouter;
		var fakeServer;

		var COST_CENTER_RESP = [200, {"Content-type" : "application/json"},
			'[{"id":10,"text":"California Water Science Center"},' +
			'{"id":11,"text":"Wisconsin Water Science Center"},' +
			'{"id":12,"text":"National Earthquake Information Center"}]'];

		var OUTSIDE_RESP = [200, {"Content-type" : "application/json"},
			'[{"id":40,"text":"Super Secret Police"},' +
			'{"id":41,"text":"Pokemon League"},' +
			'{"id":42,"text":"Tufted Titmouse"}]'];

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>')
			$testDiv = $('test-div');

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

		fdescribe('Tests for render', function() {

			beforeEach(function() {
				spyOn($.fn, 'select2').and.callThrough();
				fakeServer.respondWith(/costcenters/, COST_CENTER_RESP);
				fakeServer.respondWith(/outsideaffiliates/, OUTSIDE_RESP);
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
				expect(affiliationTypeSelect.select2).toHaveBeenCalledWith(expectedData);
			});

			it('Expects that the affiliation select2 field is disabled upon load', function() {
				testView.render();
				expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(true);
			});

			it('Expects that the cost center lookup service is called if the Cost Center type is selected', function() {
				testView.render();
				var affiliationTypeSelect = $testDiv.find('.edit-affiliation-type-input');
				affiliationTypeSelect.val(1).trigger('select2:select');
				expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(false);
			});

			it('Expects that the outsideaffiliates lookup service is called if the Outside Affiliation type is selected', function() {
				testView.render();
				var affiliationTypeSelect = $testDiv.find('.edit-affiliation-type-input');
				affiliationTypeSelect.val(2).trigger('select2:select');
				expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(false);
			});
		});
	});
});