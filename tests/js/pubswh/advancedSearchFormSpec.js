/* jslint browser: true */
/* global $ */
/* global PUBS_WH */
/* global describe, beforeEach, afterEach, it, expect, sinon, spyOn */

describe('PUBS_WH.advancedSearchForm', function() {
	"use strict";

	var $testDiv, $mapDiv;
	var fakeServer;
	var advancedSearchForm;

	beforeEach(function() {
		$('body').append('<div id="test-div"></div><div id="map-div"></div>');
		$testDiv = $('#test-div');
		$mapDiv = $('#map-div');

		fakeServer = sinon.fakeServer.create();
	});

	afterEach(function() {
		fakeServer.restore();
		$testDiv.remove();
		$mapDiv.remove();
	});

	describe('Test with no initialRows', function() {
		beforeEach(function() {
			advancedSearchForm = PUBS_WH.advancedSearchForm({
				$container: $testDiv,
				$mapContainer : $mapDiv
			});
		});

		it('Expects that the test-div and map-div will be empty', function() {
			expect($testDiv.html()).toEqual('');
			expect($mapDiv.html()).toEqual('');
		});

		it('Expect that calling addRow with a text input adds a text input row', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'text',
				placeholder: 'Enter param'
			};
			var $text;
			advancedSearchForm.addRow(row);

			expect($testDiv.children().length).toEqual(1);
			$text = $testDiv.find('input[type="text"]');
			expect($text.length).toEqual(1);
			expect($text.attr('name')).toEqual('param1');
			expect($text.attr('placeholder')).toEqual('Enter param');
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


		it('Expects that calling addRow with a select inputType and a lookup makes a web service call but does not add the options until it is successful', function() {
			var row = {
				name: 'param1',
				displayName: 'Param 1',
				inputType: 'select',
				lookup: 'kind1',
				placeholder: 'Param 1'
			};
			var $select;
			fakeServer.respondWith([200, {"Content-Type": "application/json"}, '[{"id": "1", "text": "T1"}, {"id": "2", "text": "T2"}]']);
			advancedSearchForm.addRow(row);

			expect($testDiv.children().length).toEqual(1);
			$select = $testDiv.find('select');
			expect(fakeServer.requests.length).toEqual(1);
			expect(fakeServer.requests[0].url).toContain('kind1');
			expect($select.find('option').length).toEqual(1);

			fakeServer.respond();
			expect($select.find('option').length).toBe(3);
			expect($select.find('option:first-child').html()).toEqual('Param 1');
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
			expect($select.find('option').length).toEqual(1);
		});

		it('Expects that calling addRow with a "map" inputType makes a call to create the search map and creates a hidden input', function() {
			var row = {
				name: 'map1',
				displayName: 'Map 1',
				inputType: 'map'
			};
			var $input;
			spyOn(PUBS_WH, 'createSearchMap');
			advancedSearchForm.addRow(row);
			$input = $mapDiv.find('input:hidden');

			expect($input.length).toEqual(1);
			expect($input.attr('name')).toEqual('map1');
			expect(PUBS_WH.createSearchMap).toHaveBeenCalled();
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

		//TODO: Add test for delete-row
	});

	describe("Tests with initialRows", function() {
		beforeEach(function(done) {
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
				}, {
					name: 'map1',
					displayName: 'Map 1',
					inputType: 'map',
					value: 'POLYGON((-91 39,-89 39,-89 37,-91 37,-91 39))'
				}
			];
			fakeServer.respondWith([200, {"Content-Type": "application/json"}, '[{"id": "1", "text": "T1"}, {"id": "2", "text": "T2"}]']);
			spyOn(PUBS_WH, 'createSearchMap');

			advancedSearchForm = PUBS_WH.advancedSearchForm({
				$container: $testDiv,
				$mapContainer: $mapDiv,
				initialRows: initialRows
			});
			fakeServer.respond();
			setTimeout(done, 1000); // This gives the code time to respond to the fakeServer.
		});

		it('Expects that three rows are added with the correct input type and initial value', function() {
			var $rows = $testDiv.children();
			var $maprows = $mapDiv.children();
			var $text, $select, $map;

			expect($rows.length).toEqual(2);
			expect($maprows.length).toEqual(1);
			$text = $rows.find('input[type="text"]');
			$select = $rows.find('select');
			$map = $maprows.find('input[type="hidden"]');

			expect($text.attr('name')).toEqual('param1');
			expect($text.val()).toEqual('This');
			expect($select.attr('name')).toEqual('param2');
			expect($select.find('option:selected').val()).toEqual('T2');
			expect(PUBS_WH.createSearchMap).toHaveBeenCalled();
			expect($map.attr('name')).toEqual('map1');
			expect($map.val()).toEqual('POLYGON((-91 39,-89 39,-89 37,-91 37,-91 39))');
		});
	});

});