var METRICS = window.METRICS = window.METRICS || {};

METRICS.dataUtils = (function() {
        var self = {};

    /*
     * @param {moment} forMoment - The function will return a full year range where the end will be the previous
     *      full month before forMoment.
     * @returns {Array of two moments} - The function returns an array where the first element
     * is a year before the last fullMonth before forMoment
     * and the second element is the last full month before for Moment
     */
    self.getPastYear = function(forMoment) {
        var lastMonth = forMoment.clone().subtract(1, 'months').endOf('month');
        var yearAgo = lastMonth.clone().subtract(1, 'years').add(1, 'days');
        return [yearAgo, lastMonth];
    };

    /*
     * @param {Object} - options
     *      @prop {Moment} startDate
     *      @prop {Moment} endDate
     *      @prop {String} timeUnit - year, month, day that we are processing
     *      @prop {Array of String} metricNames
     *      @prop {Array of {Object} rows
     *          @prop {moment} date
     *          @prop {String} for each element in metricNames, there will be a key with a String value representing
     *              the data for that metric.
     * @return {Array of Objects} - Each object should have the same properties as the rows elements. Missing dates
     *      will be included with the metric set to zero.
     *
     */
    self.fillMissingDates = function(options) {
        var rowIndex = 0;
        var currentDate = options.startDate.clone();
        var result = [];
        var zeroMetrics = _.object(options.metricNames, _.map(options.metricNames, function() {
 return '0';
}));
        var emptyRow;

        while (currentDate.isSameOrBefore(options.endDate, options.timeUnit)) {
            if (rowIndex < options.rows.length &&
                currentDate.isSame(options.rows[rowIndex].date, options.timeUnit)) {
                result.push(options.rows[rowIndex]);
                rowIndex = rowIndex + 1;
            } else {
                emptyRow = _.clone(zeroMetrics);
                emptyRow.date = currentDate.clone();
                result.push(emptyRow);
            }
            currentDate.add(1, options.timeUnit + 's');
        }
        return result;
    };

    return self;
})();
