import SearchMap from './searchMap';
import rowTemplate from './hb_templates/rowTemplate.hbs';
import mapTemplate from './hb_templates/mapTemplate.hbs';
import optionTemplate from './hb_templates/optionTemplate.hbs';


/*
 * Initially creates inputs to be be used for the advanced search form.
 * @param {Object} options
 *      @prop {Jquery element} $container - Where the advanced search rows will be added
 *      @prop {Jquery element} $mapContainer - Where the map inputs will be added
 *      @prop {Array of Objects} initialRows - Each object will contain the following properties
 *          @prop {String} name - to be used for the name attribute when creating the input
 *          @prop {String} displayName - to be used to identify the input
 *          @prop {String} inputType - can be any valid html5 input type, select, map, or boolean
 *          @prop {String} value - The value for this input.
 *          @prop {String} placeholder (optional) - Will be used as placeholder text
 *          @prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
 *      @prop {Function} deleteRowCallback(optional) - Function that takes the name of the input being removed when the delete
 *          row button is clicked.  This does not get called when deleteAllRows is called.
 *  @returns {Object}
 *      @prop {Function} addRow - takes single object parameter which has the same properties as the objects in initialRows
 *      @prop {Function} deleteAllRows - deletes all rows in $container and $mapContainter
 */
export default class AdvancedSearchForm {
    constructor(options) {
        this.options = options;

        // Initialize row
        if (this.options.initialRows) {
            this.options.initialRows.forEach(this.addRow.bind(this));
        }
    }


    /*
     * Adds an input to options.$container. Takes the information in row to create the specified input
     * @param {Object} row
     *      @prop {String} name - to be used for the name attribute when creating the input
     *      @prop {String} displayName - to be used to identify the input
     *      @prop {String} inputType - can be any valid html5 input type, select, boolean, or map
     *      @prop {String} value (optional) - The value for this input.
     *      @prop {String} placeholder (optional) - Will be used as placeholder text
     *      @prop {String} lookup (optional) - Used for select inputType to fill in the options via the lookup web service
     */
    addRow(row) {
        var lookupDeferred = $.Deferred();
        var lookupOptions = [];

        if (row.inputType === 'select' && row.lookup) {
            $.ajax({
                url: CONFIG.lookupUrl + row.lookup,
                method: 'GET',
                success : function(resp) {
                    lookupOptions = resp.map(function(option) {
                        var result = option;
                        result.selected = row.value ? option.text === row.value : false;
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

        var context = {
            isSelect : row.inputType === 'select' || row.inputType === 'boolean',
            isBoolean : row.inputType === 'boolean',
            isDate : row.inputType === 'date',
            mapId: row.inputType === 'map' ? 'map-name-' + row.name : '',
            row : row
        };
        var $row;

        // Additional context properties
        context.isTrue = context.isBoolean ? row.value === 'true' : false;
        context.isFalse = context.isBoolean ? row.value === 'false' : false;

        if (context.mapId) {
            this.options.$mapContainer.append(mapTemplate(context));
            $row = this.options.$mapContainer.children('div:last-child');
            new SearchMap(context.mapId, $row.find('input'));
        } else {
            this.options.$container.append(rowTemplate(context));
            $row = this.options.$container.children('div:last-child');
            if (context.isDate) {
                $row.find('.date').datetimepicker({
                    format: 'YYYY-MM-DD'
                });
            }
        }

        $row.find('.delete-row').click(() => {
            var name = $row.find(':input').attr('name');
            $row.remove();
            if (this.options.deleteRowCallback) {
                this.options.deleteRowCallback(name);
            }
        });
        lookupDeferred.done(function() {
            $row.find('select').append(optionTemplate({options: lookupOptions}));
            $row.find('select').select2();
        });
    }

    /*
     * Deletes all rows in this.options.$container and this.options.$mapContainer
     */
    deleteAllRows() {
        this.options.$container.children().remove();
        this.options.$mapContainer.children().remove();
    }
}
