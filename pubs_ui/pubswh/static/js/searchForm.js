/* jslint browser: true */
/* global $ */
/* global Handlebars */
/* global CONFIG */
/* global console */

var PUBS_WH = PUBS_WH || {};

/*
 * Initially creates inputs to be be used for the advanced search form.
 * @param {Object} options
 * 		@prop {Jquery element} $container - Where the advanced search rows will be added
 * 		@prop {Array of Objects} initialRows - Each object will contain the following properties
 * 			@prop {String} name - to be used for the name attribute when creating the input
 * 			@prop {String} displayName - to be used to identify the input
 * 			@prop {String} inputType - can be any valid html5 input type or select
 * 			@prop {String} value - The value for this input.
 * 			@prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
 * 	@returns {Object}
 * 		@prop {Function} addRow - takes single object parameter which has the same properties as the objects in initialRows
 */
PUBS_WH.advancedSearchForm = function(options) {
	"use strict";

	var self = {};

	var ROW_HTML =
		'<div class="form-group">' +
		'<div class="col-sm-3">' +
		'<span class="fa fa-minus-circle delete-row"></span>' +
		'<label class="">{{row.displayName}}:</label>' +
		'</div>' +
		'<div class="col-sm-8">' +
		'{{#if isSelect}}<select class="form-control" name="{{row.name}}">' +
		'{{#each options}}<option {{#if selected }}selected{{/if}} value="{{text}}">{{text}}</option>{{/each}}' +
		'</select>' +
		'{{else}}' +
		'<input class="form-control" type="{{row.inputType}}" name="{{row.name}}" value="{{row.value}}" />' +
		'{{/if}}' +
		'</div>' +
		'</div>';

	var rowTemplate = Handlebars.compile(ROW_HTML);

	/*
	 * Adds an input to options.$container. Takes the information in row to create the specified input
	 * @param {Object} row
	 * 		@prop {String} name - to be used for the name attribute when creating the input
	 * 		@prop {String} displayName - to be used to identify the input
	 * 		@prop {String} inputType - can be any valid html5 input type or select
 	 * 		@prop {String} value (optional) - The value for this input.
 	 * 		@prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
	 */
	self.addRow = function(row) {
		var lookupDeferred = $.Deferred();
		var lookupOptions = [];

		if ((row.inputType === 'select') && row.lookup) {
			$.ajax({
				url: CONFIG.lookupUrl + row.lookup,
				method: 'GET',
				success : function(resp) {
					lookupOptions = resp.map(function(option) {
						var result = option;
						result.selected = row.value ? (option.text === row.value) : false;
						return result;
					});

					lookupDeferred.resolve();
				},
				error : function() {
					console.log('Lookup did not succeed. Select will be empty');
					lookupDeferred.resolve();
				}
			});
		}
		else {
			lookupDeferred.resolve();
		}

		lookupDeferred.done(function() {
			var context = {
				isSelect : row.inputType === 'select',
				row : row,
				options : lookupOptions
			};
			options.$container.append(rowTemplate(context));
			if (context.isSelect) {
				options.$container.find('select[name="' + context.row.name + '"]').select2();
			}
			$('.delete-row').click(function() {
				$(this).parents('.form-group').remove();
			});
		});


	};

	//Initialize row
	options.initialRows.forEach(self.addRow);

	return self;
};
