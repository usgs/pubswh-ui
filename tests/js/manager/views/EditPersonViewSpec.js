/* jslint browser: true */
/* global define */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */

define([
	'squire',
	'jquery',
	'select2',
	'underscore',
	'backbone',
	'models/LookupModel'
], function(Squire, $, select2, _, Backbone, LookupModel) {
	"use strict";

	describe('views/EditPersonView', function() {
		var EditPersonView, testView;
		var $testDiv;
		var testModel;

		var costCenterFetchSpy, costCenterFetchActiveDeferred, costCenterFetchNotActiveDeferred;
		var outsideAffFetchSpy, outsideAffFetchActiveDeferred, outsideAffFetchNotActiveDeferred;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testModel = new Backbone.Model();

			costCenterFetchActiveDeferred = $.Deferred();
			costCenterFetchNotActiveDeferred = $.Deferred();
			costCenterFetchSpy = jasmine.createSpy('costCenterFetchSpy').and.callFake(function(options) {
				if (options.data.active === 'y') {
					return costCenterFetchActiveDeferred;
				}
				else {
					return costCenterFetchNotActiveDeferred;
				}
			});

			outsideAffFetchActiveDeferred = $.Deferred();
			outsideAffFetchNotActiveDeferred  = $.Deferred();
			outsideAffFetchSpy = jasmine.createSpy('outsideAffFetchSpy').and.callFake(function(options) {
				if (options.data.active === 'y') {
					return outsideAffFetchActiveDeferred;
				}
				else {
					return outsideAffFetchNotActiveDeferred;
				}
			});

			injector = new Squire();
			injector.mock('jquery', $);
			injector.mock('models/CostCenterCollection', Backbone.Collection.extend({
				model : LookupModel,
				url : '/test/lookup',
				fetch : costCenterFetchSpy
			}));
			injector.mock('models/OutsideAffiliationLookupCollection', Backbone.Collection.extend({
				model : LookupModel,
				url : '/test/lookup',
				fetch : outsideAffFetchSpy
			}));

			injector.require(['views/EditPersonView'], function(View){
				EditPersonView = View;
				testView = new EditPersonView({
					el : $testDiv,
					model : testModel
				});
				done();
			});
		});

		afterEach(function() {
			injector.remove();
			testView.remove();
			$testDiv.remove();
		});

		it('Expects the active and not active cost centers to be fetched', function() {
			expect(costCenterFetchSpy.calls.count()).toBe(2);
			expect(_.find(costCenterFetchSpy.calls.allArgs(), function(arg) {
				return arg[0].data.active === 'y';
			})).toBeDefined();
			expect(_.find(costCenterFetchSpy.calls.allArgs(), function(arg) {
				return arg[0].data.active === 'n';
			})).toBeDefined();
		});

		it('Expects the active and not active outside affiliations to be fetched', function() {
			expect(outsideAffFetchSpy.calls.count()).toBe(2);
			expect(_.find(outsideAffFetchSpy.calls.allArgs(), function(arg) {
				return arg[0].data.active === 'y';
			})).toBeDefined();
			expect(_.find(outsideAffFetchSpy.calls.allArgs(), function(arg) {
				return arg[0].data.active === 'n';
			})).toBeDefined();
		});

		describe('Tests for render', function() {

			beforeEach(function() {
				spyOn($.fn, 'select2').and.callThrough();
				testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
				testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);

			});

			it('Expects that the DOM text and checkbox elements reflect the contents of the model', function() {
				testModel.set({
					given : 'Mary',
					family : 'Jones',
					suffix : 'MD',
					email : 'mjones@usgs.gov',
					usgs : true
				});
				testView.render();

				expect($testDiv.find('#first-name').val()).toEqual('Mary');
				expect($testDiv.find('#last-name').val()).toEqual('Jones');
				expect($testDiv.find('#suffix').val()).toEqual('MD');
				expect($testDiv.find('#email').val()).toEqual('mjones@usgs.gov');
				expect($testDiv.find('#is-usgs').is(':checked')).toEqual(true);
			});

			it('Expects that is usgs is set to true, then the cost center select is shown', function() {
				testModel.set({
					usgs : true
				});
				testView.render();

				expect($testDiv.find('.outside-affiliation-div').is(':visible')).toBe(false);
				expect($testDiv.find('.usgs-affiliation-div').is(':visible')).toBe(true);
			});

			it('Expects that is usgs is set to false, then the outside affiliation select is shown', function() {
				testModel.set({
					usgs : false
				});
				testView.render();

				expect($testDiv.find('.outside-affiliation-div').is(':visible')).toBe(true);
				expect($testDiv.find('.usgs-affiliation-div').is(':visible')).toBe(false);
			});

			it('Expects the cost center select to be initialized when both active and not active cost centers have been fetched', function() {
				testView.render();
				costCenterFetchActiveDeferred.resolve();

				expect($.fn.select2).not.toHaveBeenCalled();

				costCenterFetchNotActiveDeferred.resolve();

				expect($.fn.select2).toHaveBeenCalled();
				expect($.fn.select2.calls.first().object.hasClass('usgs-affiliation-select'));
			});

			it('Expects the outside affiliation select to be initialized when both active and not active outside affiliations have been fetched', function() {
				testView.render();
				outsideAffFetchActiveDeferred.resolve();

				expect($.fn.select2).not.toHaveBeenCalled();

				outsideAffFetchNotActiveDeferred.resolve();

				expect($.fn.select2).toHaveBeenCalled();
				expect($.fn.select2.calls.first().object.hasClass('outside-affiliation-select'));
			});

			it('Expects the cost center value to be set if usgs is set in the model and the affiliation is defined', function() {
				testModel.set({
					usgs : true,
					affiliation : {id : 2, text : 'CC2'}
				});
				testView.render();
				costCenterFetchActiveDeferred.resolve();
				costCenterFetchNotActiveDeferred.resolve();
				outsideAffFetchActiveDeferred.resolve();
				outsideAffFetchNotActiveDeferred.resolve();

				expect($testDiv.find('.usgs-affiliation-select').val()).toEqual('2');
			});

			it('Expects the outside affiliation value to be set if usgs is set to false in the model and the affiliation is defined', function() {
				testModel.set({
					usgs : false,
					affiliation : {id : 4, text : 'OA4'}
				});
				testView.render();
				costCenterFetchActiveDeferred.resolve();
				costCenterFetchNotActiveDeferred.resolve();
				outsideAffFetchActiveDeferred.resolve();
				outsideAffFetchNotActiveDeferred.resolve();

				expect($testDiv.find('.outside-affiliation-select').val()).toEqual('4');
			});
		});

		describe('Tests for model event handlers', function() {
			beforeEach(function() {
				costCenterFetchActiveDeferred.resolve();
				costCenterFetchNotActiveDeferred.resolve();
				outsideAffFetchActiveDeferred.resolve();
				outsideAffFetchNotActiveDeferred.resolve();
				testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
				testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);
				testView.render();
			});

			it('Expects that the text and checkbox inputs are updated when there properties are updated', function() {
				testModel.set({
					given : 'Mary',
					family : 'Jones',
					suffix : 'MD',
					email : 'mjones@usgs.gov',
					usgs : true
				});

				expect($testDiv.find('#first-name').val()).toEqual('Mary');
				expect($testDiv.find('#last-name').val()).toEqual('Jones');
				expect($testDiv.find('#suffix').val()).toEqual('MD');
				expect($testDiv.find('#email').val()).toEqual('mjones@usgs.gov');
				expect($testDiv.find('#is-usgs').is(':checked')).toEqual(true);
			});

			it('Expects that if the usgs input is true, the cost center select will be visible and set to the value in affiliation', function() {
				var $selectDiv = $('.usgs-affiliation-div');
				testModel.set({
					usgs : true,
					affiliation : {id : 2, text : 'CC2'}
				});

				expect($selectDiv.is(':visible')).toBe(true);
				expect($selectDiv.find('select').val()).toEqual('2');

				testModel.unset('affiliation');

				expect($selectDiv.find('select').val()).toEqual(null);
			});

			it('Expects that if the usgs input is false, the outside affiliation select will be visible and set to the value in affiliation', function() {
				var $selectDiv = $('.outside-affiliation-div');
				testModel.set({
					usgs : true,
					affiliation : {id : 2, text : 'CC2'}
				});
				testModel.set({
					usgs : false,
					affiliation : {id : 4, text : 'OA4'}
				});

				expect($selectDiv.is(':visible')).toBe(true);
				expect($selectDiv.find('select').val()).toEqual('4');

				testModel.unset('affiliation');

				expect($selectDiv.find('select').val()).toEqual(null);
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				costCenterFetchActiveDeferred.resolve();
				costCenterFetchNotActiveDeferred.resolve();
				outsideAffFetchActiveDeferred.resolve();
				outsideAffFetchNotActiveDeferred.resolve();
				testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
				testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);
				testView.render();
			});

			it('Expects that updating text and checkbox inputs is reflected in the model', function() {
				$testDiv.find('#first-name').val('Mary').trigger('change');
				expect(testModel.get('given')).toEqual('Mary');

				$testDiv.find('#last-name').val('Jones').trigger('change');
				expect(testModel.get('family')).toEqual('Jones');

				$testDiv.find('#suffix').val('PhD').trigger('change');
				expect(testModel.get('suffix')).toEqual('PhD');

				$testDiv.find('#email').val('mjones@google.com').trigger('change');
				expect(testModel.get('email')).toEqual('mjones@google.com');

				$testDiv.find('#is-usgs').trigger('click');
				expect(testModel.get('usgs')).toBe(true);

				$testDiv.find('#is-usgs').trigger('click');
				expect(testModel.get('usgs')).toBe(false);
			});

			it('Expects that if the usgs select2 is changed, the affiliation is updated', function() {
				var $usgsSelect = $testDiv.find('.usgs-affiliation-select');
				testModel.set({usgs : true});
				$usgsSelect.val('2').trigger('select2:select');

				expect(testModel.get('affiliation')).toEqual({id : '2', text : 'CC2'});

				$usgsSelect.val('').trigger('select2:unselect');

				expect(testModel.has('affiliation')).toBe(false);
			});

			it('Expects that if the outside affiliation select2 is changed, the affiliation is updated', function() {
				var $outsideSelect = $testDiv.find('.outside-affiliation-select');
				testModel.set({usgs : true});
				$outsideSelect.val('4').trigger('select2:select');

				expect(testModel.get('affiliation')).toEqual({id : '4', text : 'OA4'});

				$outsideSelect.val('').trigger('select2:unselect');
				expect(testModel.has('affiliation')).toBe(false);
			});
		});
	});
});