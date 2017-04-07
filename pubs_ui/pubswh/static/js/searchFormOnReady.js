/* jslint browser: true */
/* global $ */
/* global PUBS_WH */
/* global CONFIG */

$(document).ready(function() {
	"use strict";

	var initialSearchRows = [];
	var $form = $('#search-pubs-form');
	var $categorySelect = $form.find('.search-category-select');
	var $addCategoryBtn = $form.find('.add-search-category');
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
		initialRows : initialSearchRows
	});

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

});