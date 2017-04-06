/* jslint browser: true */
/* global $ */
/* global PUBS_WH */
/* global describe, beforeEach, afterEach, it, expect, sinon */

describe('PUBS_WH.advancedSearchForm', function() {
	"use strict";

	var $testDiv;
	var fakeServer;
	var advancedSearchForm;

	beforeEach(function() {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');

		fakeServer = sinon.fakeServer.create();
	});

	afterEach(function() {
		fakeServer.restore();
		$testDiv.remove();
	});

	describe('Test with no initialRows', function() {
		beforeEach(function() {
			advancedSearchForm = PUBS_WH.advancedSearchForm({
				$container: $testDiv
			});
		});

		it('Expects that the test-div will be empty', function() {
			expect($testDiv.html()).toEqual('');
		});

		it('Expect that calling addRow with a text input adds a text input row', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'text'
			};
			var $text;
			advancedSearchForm.addRow(row);

			expect($testDiv.children().length).toEqual(1);
			$text = $testDiv.find('input[type="text"]');
			expect($text.length).toEqual(1);
			expect($text.attr('name')).toEqual('param1');
			expect($testDiv.find('label').html()).toContain('Param 1');
		});

		it('Expects that calling addRow with a checkbox input adds a checkbox input', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'checkbox'
			};
			var $checkbox;
			advancedSearchForm.addRow(row);

			expect($testDiv.find('input[type="checkbox"]').length).toEqual(1);
		});


		it('Expects that calling addRow with a select inputType and a lookup makes a web service call but does not render the row until it is successful', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'select',
				lookup: 'kind1'
			};
			var $select;
			fakeServer.respondWith([200, {"Content-Type": "application/json"}, '[{"id": "1", "text": "T1"}, {"id": "2", "text": "T2"}]']);
			advancedSearchForm.addRow(row);

			expect($testDiv.children().length).toEqual(0);
			expect(fakeServer.requests.length).toEqual(1);
			expect(fakeServer.requests[0].url).toContain('kind1');

			fakeServer.respond();
			expect($testDiv.children().length).toEqual(1);
			$select = $testDiv.find('select');
			expect($select.length).toBe(1);
			expect($select.find('option[value="T1"]').length).toEqual(1);
			expect($select.find('option[value="T2"]').length).toEqual(1);
		});

		it('Expects that calling addRow with a select inputType and a lookup makes web service call but creates a select menu with no options', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'select',
				lookup: 'kind1'
			};
			var $select;
			fakeServer.respondWith([500, {}, "Internal server error"]);
			advancedSearchForm.addRow(row);
			fakeServer.respond();

			$select=$testDiv.find('select');
			expect($select.length).toEqual(1);
			expect($select.find('option[value]').length).toEqual(0);
		});

		it('Expects that clicking on that calling addRow a second time adds the second row to the bottom of the div', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'text'
			};
			var $lastInput;
			advancedSearchForm.addRow(row);
			row = {
				name: 'param2',
				displayName: 'Param 2',
				inputType: 'text'
			};
			advancedSearchForm.addRow(row);

			expect($testDiv.children().length).toEqual(2);
			$lastInput = $testDiv.children().eq(1).find('input');
			expect($lastInput.attr('type')).toEqual('text');
			expect($lastInput.attr('name')).toEqual('param2');
		});
	});

	describe("Tests with initialRows", function() {
		beforeEach(function() {
			var initialRows = [
				{
					name: 'param1',
					displayName: 'Param 1',
					inputType: 'text',
					value: 'This'
				}, {
					name: 'param2',
					displayName: 'Param 2',
					inputType: 'select',
					lookup: 'kind1',
					value: 'T2'
				}
			];
			fakeServer.respondWith([200, {"Content-Type": "application/json"}, '[{"id": "1", "text": "T1"}, {"id": "2", "text": "T2"}]']);

			advancedSearchForm = PUBS_WH.advancedSearchForm({
				$container: $testDiv,
				initialRows: initialRows
			});
			fakeServer.respond();
		});

		it('Expects that two rows are added with the correct input type and initial value', function() {
			var $rows = $testDiv.children();
			var $input1, $input2;

			expect($rows.length).toEqual(2);
			$input1 = $rows.eq(0).find('input');
			$input2 = $rows.eq(1).find('select');
			expect($input1.attr('name')).toEqual('param1');
			expect($input1.val()).toEqual('This');
			expect($input2.attr('name')).toEqual('param2');
			expect($input2.val()).toEqual('T2');
		});
	});

});