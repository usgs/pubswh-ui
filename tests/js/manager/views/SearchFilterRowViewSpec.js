/* jslint browser:true */
/* global define */
/* global describe, beforeEach, jasmine, afterEach, spyOn, it, expect */

define([
	'squire',
	'jquery',
	'select2',
	'backbone'
], function(Squire, $, select2, Backbone) {
	"use strict";

	describe('SearchFilterRowView', function() {
		var SearchFilterRowView, testView, testModel;
		var fetchPubTypeSpy, fetchPubTypeDeferred;
		var injector;

		beforeEach(function (done) {
			injector = new Squire();

			$('body').append('<div id="test-div"></div>');
			testModel = new Backbone.Model();

			fetchPubTypeDeferred = $.Deferred();
			fetchPubTypeSpy = jasmine.createSpy('fetchPubTypeSpy').and.returnValue(fetchPubTypeDeferred);

			injector.mock('models/PublicationTypeCollection', Backbone.Collection.extend({
				fetch: fetchPubTypeSpy
			}));

			spyOn($.fn, 'select2');
			injector.mock('jquery', $); // Needed to spy on select2 initialization.

			injector.require(['views/SearchFilterRowView'], function (view) {
				SearchFilterRowView = view;
				testView = new SearchFilterRowView({
					el: '#test-div',
					model: testModel
				});
				done();
			});

		});

		afterEach(function () {
			injector.remove();
			testView.remove();
			$('#test-div').remove();
		});

		it('Expect the publication type collection  to be fetched at initialization', function () {
			expect(fetchPubTypeSpy).toHaveBeenCalled();
		});

		describe('Tests for render', function () {
			it('Expects that if the model has some filter categories set, those category options will be disabled', function () {
				testModel.set({
					prodId: '1234',
					subtypeName: 'Subtype 1'
				});
				testView.render();
				expect(testView.$('.search-category-input option[value="prodId"]').is(':disabled')).toBe(true);
				expect(testView.$('.search-category-input option[value="indexId"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="ipdsId"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="contributor"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="title"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="typeName"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="subtypeName"]').is(':disabled')).toBe(true);
				expect(testView.$('.search-category-input option[value="seriesName"]').is(':disabled')).toBe(false);
				expect(testView.$('.search-category-input option[value="year"]').is(':disabled')).toBe(false);
			});
		});

		describe('Tests for remove', function () {
			it('Expects that if the category has been set for the row that the correpsonding model property is cleared', function () {
				testView.render();
				testView.$('.search-category-input').val('prodId').trigger('change');
				testView.$('.value-text-input').val('1234').trigger('change');
				expect(testModel.get('prodId')).toEqual('1234');

				testView.remove();

				expect(testModel.has('prodId')).toBe(false);
			});
		});

		describe('Tests for model event handlers', function () {
			beforeEach(function () {
				testView.render();
			});

			it('Expects that if a filter model attribute is set, then that option is disabled', function () {
				var $prodIdOption = testView.$('.search-category-input option[value="prodId"]');
				expect($prodIdOption.is(':disabled')).toBe(false);
				testModel.set('prodId', '', {changedAttribute : 'prodId'});
				expect($prodIdOption.is(':disabled')).toBe(true);
			});

			it('Expects that if a filter model attribute is unset, then that option becomes enabled', function() {
				var $prodIdOption = testView.$('.search-category-input option[value="prodId"]');
				testModel.set('prodId', '', {changedAttribute : 'prodId'});
				expect($prodIdOption.is(':disabled')).toBe(true);
				testModel.unset('prodId', {changedAttribute : 'prodId'});
				expect($prodIdOption.is(':disabled')).toBe(false);
			});
		});

		describe('Tests for DOM event handlers', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that if the category select option is set, the model property is set and the previous value is unset', function() {
				var $categorySelect = testView.$('.search-category-input');
				$categorySelect.val('prodId').trigger('change');
				expect(testModel.has('prodId')).toBe(true);

				$categorySelect.val('subtypeName').trigger('change');
				expect(testModel.has('prodId')).toBe(false);
				expect(testModel.has('subtypeName')).toBe(true);

				$categorySelect.val('').trigger('change');
				expect(testModel.has('subtypeName')).toBe(false);
			});

			it('Expects that if the category select option is set, the appropriate input element is shown and initialized and that both inputs are cleared', function() {
				var $categorySelect = testView.$('.search-category-input');
				var $textInput = testView.$('.value-text-input');
				var $selectInput = testView.$('.value-select-input');
				var select2Count = $.fn.select2.calls.count();

				$categorySelect.val('prodId').trigger('change');
				expect($textInput.is(':visible')).toBe(true);
				expect($selectInput.is(':visible')).toBe(false);
				expect($.fn.select2.calls.count()).toEqual(select2Count);

				$textInput.val('1234');
				$categorySelect.val('subtypeName').trigger('change');
				expect($textInput.is(':visible')).toBe(false);
				expect($textInput.val()).toBe('');
				expect($selectInput.is(':visible')).toBe(true);
				expect($.fn.select2.calls.count()).toEqual(select2Count + 2); // calls destroy and then initialize

				$selectInput.val('Subtype 1');
				$categorySelect.val('year').trigger('change');
				expect($textInput.is(':visible')).toBe(true);
				expect($selectInput.is(':visible')).toBe(false);
				expect($selectInput.val()).toBe(null);
				expect($.fn.select2.calls.count()).toEqual(select2Count + 2);
			});

			it('Expects that if the category is changed to typeName the select2 will not be initialized until after the publication type collection is fetched', function() {
				var $categorySelect = testView.$('.search-category-input');
				var select2Count;

				$categorySelect.val('typeName').trigger('change');
				select2Count = $.fn.select2.calls.count();

				fetchPubTypeDeferred.resolve();
				expect($.fn.select2.calls.count()).toEqual(select2Count + 1);
			});

			it('Expect that if the text or selected value changes the selected category value is updated in the model', function() {
				var $categorySelect = testView.$('.search-category-input');
				var $textInput = testView.$('.value-text-input');
				var $selectInput = testView.$('.value-select-input');

				$categorySelect.val('prodId').trigger('change');
				$textInput.val('1234').trigger('change');
				expect(testModel.get('prodId')).toEqual('1234');

				$textInput.val('4567').trigger('change');
				expect(testModel.get('prodId')).toEqual('4567');

				$categorySelect.val('subtypeName').trigger('change');
				// Have to add the options to the DOM
				$selectInput.append('<option id="1">Subtype 1</option><option id="2">Subtype 2</option>');
				$selectInput.val('Subtype 1').trigger('change');
				expect(testModel.get('subtypeName')).toEqual(['Subtype 1']);
				$selectInput.val(['Subtype 1', 'Subtype 2']).trigger('change');
				expect(testModel.get('subtypeName')).toEqual(['Subtype 1', 'Subtype 2']);
			});
		});
	});
});
