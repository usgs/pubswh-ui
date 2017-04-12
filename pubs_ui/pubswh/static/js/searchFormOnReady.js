/* jslint browser: true */
/* global $ */
/* global PUBS_WH */
/* global CONFIG */

$(document).ready(function() {
	"use strict";

	// Constants for link text
	var SHOW_SEARCH = 'Show Advanced Search';
	var HIDE_SEARCH = 'Clear Advanced Search';

	var initialSearchRows = [];
	var $form = $('#search-pubs-form');
	var $showHideSearchBtn = $form.find('#show-hide-advanced-search-btn');
	var $categorySelect = $form.find('.search-category-select');
	var $addCategoryBtn = $form.find('.add-search-category');
	var $clearSearchBtn = $form.find('.clear-search-btn');
	var $qSearch = $form.find('input[name="q"]');
	var $advancedSearchDiv = $form.find('.advanced-search-div');
	var advancedSearchForm;

	// Retrieve information to create the initial search rows from the query parameters and search category list.
	if (CONFIG.requestArgs !== {}) {
		$.each(CONFIG.requestArgs, function (name, value) {
			var $thisOption = $categorySelect.find('option[value="' + name + '"]');
			if ($thisOption.length) {
				initialSearchRows.push({
					name: name,
					displayName: $thisOption.html(),
					inputType: $thisOption.data('input-type'),
					value: value,
					placeholder: $thisOption.data('placeholder'),
					lookup: $thisOption.data('lookup')
				});
			}
		});
	}
	advancedSearchForm = PUBS_WH.advancedSearchForm ({
		$container : $form.find('.advanced-search-container'),
		$mapContainer: $form.find('.map-search-container'),
		initialRows : initialSearchRows
	});

	// Show/hide advanced search and add click handler for toggle link
	if (initialSearchRows.length > 0) {
		$showHideSearchBtn.html(HIDE_SEARCH);
		$advancedSearchDiv.show();
	}
	else {
		$showHideSearchBtn.html(SHOW_SEARCH);
		$advancedSearchDiv.hide();
	}
	$showHideSearchBtn.click(function() {
		if ($advancedSearchDiv.is(':visible')) {
			$showHideSearchBtn.html(SHOW_SEARCH);
			advancedSearchForm.deleteAllRows();
			$advancedSearchDiv.hide();
		}
		else {
			$showHideSearchBtn.html(HIDE_SEARCH);
			$advancedSearchDiv.show();
		}
	});

	// Set up advanced search category select and add category button click handler
	$categorySelect.select2();
	$categorySelect.change(function() {
		$addCategoryBtn.prop('disabled',  !$(this).val());
	});

	$addCategoryBtn.click(function() {
		var $selectedOption = $categorySelect.find('option:selected');
		advancedSearchForm.addRow({
			name: $selectedOption.val(),
			displayName: $selectedOption.html(),
			inputType: $selectedOption.data('inputType'),
			placeholder: $selectedOption.data('placeholder'),
			lookup: $selectedOption.data('lookup')
		});
	});

	// Add click handler for clear search terms
	$clearSearchBtn.click(function() {
		$qSearch.val('');
	});
});