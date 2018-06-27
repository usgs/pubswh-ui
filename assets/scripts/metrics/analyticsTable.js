
import template from './analyticsTableContents.hbs';
/*
 * Creates a table of the data
 * @param {Jquery Table element} $table
 * @param {Array of Array} rows -  where the first element is a moment and the second element is the data to be graphed.
 * @param {Object} options
 *      @prop {String} columnLabel
 *      @prop {String} dateFormat - Formatting to be used for the date
 */
export const createTable = function($table, rows, options = {}) {
    const localRows = rows.map((row) => {
        return {
            date: moment(row[0]).format(options.dateFormat),
            value: row[1]
        };
    });

    $table.html(template({
        columnLabel: options.columnLabel ? options.columnLabel : '',
        rows: localRows
    }));
};