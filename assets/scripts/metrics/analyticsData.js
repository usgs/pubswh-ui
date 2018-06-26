import has from 'lodash/has';
import map from 'lodash/map';
import partial from 'lodash/partial';
import reduce from 'lodash/reduce';

import { getPastYear, fillMissingDates } from './dataUtils';


const DATE_FORMAT = 'YYYY-MM-DD';
const MONTH_DIM_FORMAT = 'YYYYMM';
const DAY_DIM_FORMAT = 'YYYYMMDD';
const BATCH_FETCH_ENDPOINT = CONFIG.JSON_LD_ID_BASE_URL + 'metrics/gadata/';


const transformRow = function(metricNames, dateDimFormat, row) {
    var result = reduce(metricNames, function (obj, name, index) {
        obj[name] = row.metrics[0].values[index];
        return obj;
    }, {});
    result.date = moment(row.dimensions[0], dateDimFormat);
    return result;
};

/*
 * @param {Array of Object} metricsAndDimFilters - each element in the array will generate a unique request
 *      @prop {Array of Metric} metrics - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#metric}
 *      @prop {DimensionFilterClause} dimFilters - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#dimensionfilterclause
 * @param {moment} fromDate (optional) - data should be returned for the previous year fromDate for 12 full months. If omitted, it will be from today
 * @returns Jquery Promise
 *      @resolve - successfully retrieval. Response is {Array of Object} representing the data. The length of this
 *          array will be the same as metricsAndDimFilters and the returned data will be in the same order.
 *          @prop {moment} date,
 *          @prop {String} <metricName for each metric in the corresponding metrics property>
 *      @reject - somethings went wrong - returns response. The responseJSON.error.message can be used to determine
 *          why the request failed.
 */
export const batchFetchMonthlyPastYear = function(metricsAndDimFilters, fromDate) {
    var requestedDate = fromDate ? fromDate : moment();
    var dateRange = getPastYear(requestedDate);

    var transformToRequest = function(metricAndDimFilter) {
        return {
            dateRanges : [{
                startDate : dateRange[0].format(DATE_FORMAT),
                endDate : dateRange[1].format(DATE_FORMAT)
            }],
            dimensions : [{name: 'ga:yearMonth'}],
            metrics : metricAndDimFilter.metrics,
            dimensionFilterClauses : metricAndDimFilter.dimFilters
        };
    };

    var deferred = $.Deferred();
    $.ajax({
        url : BATCH_FETCH_ENDPOINT,
        method: 'POST',
        contentType : 'application/json',
        data : JSON.stringify(metricsAndDimFilters.map(transformToRequest)),
        success: function(response) {
            var transformResponse = function(report) {
                var metricNames = map(report.columnHeader.metricHeader.metricHeaderEntries, 'name');
                var transformMonthRow = partial(transformRow, metricNames, MONTH_DIM_FORMAT);
                var rows = has(report.data, 'rows') ? report.data.rows : [];

                return fillMissingDates({
                    startDate: dateRange[0],
                    endDate: dateRange[1],
                    timeUnit: 'month',
                    metricNames: metricNames,
                    rows: rows.map(transformMonthRow)
                });
            };

            deferred.resolve(response.reports.map(transformResponse));
        },
        error : function(jqXHR) {
            deferred.reject(jqXHR);
        },
        processData : false
    });

    return deferred;
};

/*
 * @param {Array of Object} metricsAndDimFilters - each element in the array will generate a unique request
 *      @prop {Array of Metric} metrics - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#metric}
 *      @prop {DimensionFilterClause} dimFilters - see https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#dimensionfilterclause
 * @param {moment} fromDate (optional) - data should be returned for the previous year fromDate for 12 full months. If omitted, it will be from today
 * @returns Jquery Promise
 *      @resolve - successfully retrieval. Response is {Array of Object} representing the data. The length of this
 *          array will be the same as metricsAndDimFilters and the returned data will be in the same order.
 *          @prop {moment} date,
 *          @prop {String} <metricName for each metric in the corresponding metrics property>
 *      @reject - somethings went wrong - returns response. The responseJSON.error.message can be used to determine
 *          why the request failed.  *  @returns Jquery Promise
 */
export const batchFetchPast30Days = function(metricsAndDimFilters, fromDate) {
    var requestedDate = fromDate ? fromDate : moment();
    var thirtyDaysAgo = requestedDate.clone().subtract(30, 'days');

    var transformToRequest = function(metricAndDimFilter) {
        return {
            dateRanges : [{
                startDate : thirtyDaysAgo.format(DATE_FORMAT),
                endDate : requestedDate.format(DATE_FORMAT)
            }],
            dimensions : [{name: 'ga:date'}],
            metrics : metricAndDimFilter.metrics,
            dimensionFilterClauses : metricAndDimFilter.dimFilters
        };
    };

    var deferred = $.Deferred();

    $.ajax({
        url : BATCH_FETCH_ENDPOINT,
        method: 'POST',
        contentType : 'application/json',
        data : JSON.stringify(metricsAndDimFilters.map(transformToRequest)),
        success: function(response) {
            var transformResponse = function(report) {
                var metricNames = map(report.columnHeader.metricHeader.metricHeaderEntries, 'name');
                var transformDayRow = partial(transformRow, metricNames, DAY_DIM_FORMAT);
                var rows = has(report.data, 'rows') ? report.data.rows : [];

                return fillMissingDates({
                    startDate: thirtyDaysAgo,
                    endDate: requestedDate,
                    timeUnit: 'day',
                    metricNames: metricNames,
                    rows: rows.map(transformDayRow)
                });
            };

            deferred.resolve(response.reports.map(transformResponse));
        },
        error : function(jqXHR) {
            deferred.reject(jqXHR);
        },
        processData : false
    });

    return deferred;
};
