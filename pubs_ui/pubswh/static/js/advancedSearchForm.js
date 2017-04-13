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
 * 		@prop {Jquery element} $mapContainer - Where the map inputs will be added
 * 		@prop {Array of Objects} initialRows - Each object will contain the following properties
 * 			@prop {String} name - to be used for the name attribute when creating the input
 * 			@prop {String} displayName - to be used to identify the input
 * 			@prop {String} inputType - can be any valid html5 input type, select, map, or boolean
 * 			@prop {String} value - The value for this input.
 * 			@prop {String} placeholder (optional) - Will be used as placeholder text
 * 			@prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
 * 		@prop {Function} deleteRowCallback(optional) - Function that takes the name of the input being removed when the delete
 * 			row button is clicked.	This does not get called when deleteAllRows is called.
 * 	@returns {Object}
 * 		@prop {Function} addRow - takes single object parameter which has the same properties as the objects in initialRows
 *		@prop {Function} deleteAllRows - deletes all rows in $container and $mapContainter
 */
PUBS_WH.advancedSearchForm = function(options) {
	"use strict";

	var self = {};

	var ROW_HTML =
		'<div class="form-group">' +
		'<div class="col-sm-4">' +
		'<span class="fa fa-minus-circle delete-row"></span>' +
		'<label class="">{{row.displayName}}:</label>' +
		'</div>' +
		'<div class="col-sm-8">' +
		'{{#if isSelect}}<select class="form-control" name="{{row.name}}">' +
		'<option value="">{{row.placeholder}}</option>' +
		'{{#if isBoolean}}' +
		'<option value="true" {{#if isTrue}}selected{{/if}}>True</option>' +
		'<option value="false" {{#if isFalse}}selected{{/if}}>False</option>' +
		'{{/if}}' +
		'</select>' +
		'{{else if isDate}}' +
		'<div class="input-group date">' +
		'<input type="text" name="{{row.name}}" value="{{row.value}}" class="form-control" />' +
		'<span class="input-group-addon">' +
		'<i class="fa fa-calendar"></i>' +
		'</span>' +
		'</div>' +
		'{{else}}' +
		'<input class="form-control" type="{{row.inputType}}" name="{{row.name}}" value="{{row.value}}" placeholder="{{row.placeholder}}"/>' +
		'{{/if}}' +
		'</div>' +
		'</div>';

	var MAP_HTML =
		'<div class="form-group">' +
		'<div class="col-sm-3">' +
		'<span class="fa fa-minus-circle delete-row"></span>' +
		'<label class="">{{row.displayName}}:</label>' +
		'</div>' +
		'<div class="col-sm-12 search-form-map-div" id="{{mapId}}"></div>' +
		'<input type="hidden" name="{{row.name}}" value="{{row.value}}" />' +
		'</div>';

	var OPTION_HTML = '{{#each options}}<option {{#if selected }}selected{{/if}} value="{{text}}">{{text}}</option>{{/each}}';

	var rowTemplate = Handlebars.compile(ROW_HTML);
	var mapTemplate = Handlebars.compile(MAP_HTML);
	var optionTemplate = Handlebars.compile(OPTION_HTML);

	/*
	 * Adds an input to options.$container. Takes the information in row to create the specified input
	 * @param {Object} row
	 * 		@prop {String} name - to be used for the name attribute when creating the input
	 * 		@prop {String} displayName - to be used to identify the input
	 * 		@prop {String} inputType - can be any valid html5 input type, select, boolean, or map
 	 * 		@prop {String} value (optional) - The value for this input.
	 * 		@prop {String} placeholder (optional) - Will be used as placeholder text
 	 * 		@prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
	 */
	self.addRow = function(row) {
		var lookupDeferred = $.Deferred();
		var addRowDeferred = $.Deferred();
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
				error : function(jqXHR) {
					console.log('Lookup did not succeed. Select will be empty');
					lookupDeferred.resolve();
				}
			});
		}

		var context = {
			isSelect : row.inputType === 'select' || row.inputType === 'boolean',
			isBoolean : row.inputType === 'boolean',
			isDate : row.inputType === 'date',
			mapId: (row.inputType === "map") ? 'map-name-' + row.name : '',
			row : row
		};
		var $row;

		// Additional context properties
		context.isTrue = context.isBoolean ? (row.value === 'true') : false;
		context.isFalse = context.isBoolean ? (row.value === 'false') : false;

		if (context.mapId) {
			options.$mapContainer.append(mapTemplate(context));
			$row = options.$mapContainer.children('div:last-child');
			PUBS_WH.createSearchMap(context.mapId, $row.find('input'));
		} else {
			options.$container.append(rowTemplate(context));
			$row = options.$container.children('div:last-child');
			if (context.isDate) {
				$row.find('.date').datetimepicker({
					format: 'YYYY-MM-DD'
				});
			}
		}

		$row.find('.delete-row').click(function() {
			var name = $row.find(':input').attr('name');
			$row.remove();
			if (options.deleteCallback) {
				options.deleteCallback(name);
			}
		});
		lookupDeferred.done(function() {
			$row.find('select').append(optionTemplate({options: lookupOptions}));
			$row.find('select').select2();
		});
	};

	/*
	 * Deletes all rows in options.$container and options.$mapContainer
	 */
	self.deleteAllRows = function() {
		options.$container.children().remove();
		options.$mapContainer.children().remove();
	};

	//Initialize row
	if (options.initialRows) {
		options.initialRows.forEach(self.addRow);
	}

	return self;
};
