import $ from 'jquery';
import clone from 'lodash/clone';
import extend from 'lodash/extend';
import has from 'lodash/has';
import isFunction from 'lodash/isFunction';


/*
 * @param {Object} options
 *     @prop {String or Function which returns a String} lookupType - Used to form the url. It is appended to the lookupUrl in the module config.
 *     @prop {String} parentId(optional) - parameter name to be used when retrieving the lookup
 *     @prop {Function} getParentId - optional but should be specified if parentId is specified.
 *                 Function should return a String that will be used as the parentId value when retrieving the lookup
 *     @prop {Object} subgroups - Specify this if you would like the options sorted by subgroups. The subgroups would require
 *          separate lookup calls
 *          @prop {String} queryParameter
 *          @prop {Array of Object} nameAndValues - where each Object has a {String} name property for the display name
 *              of the group and a {String} value property for the query parameter value.
 * @param {Object} defaults(optional) - select2Options which will be merged with the ajax option set by this function
 */
 export const getSelectOptions = function(options, defaults) {
    let url;
    const SUBGROUP_CHILDREN_LIMIT = 30;
    if (isFunction(options.lookupType)) {
        url = function() {
            return window.CONFIG.lookupUrl + options.lookupType();
        };
    } else {
        url = window.CONFIG.lookupUrl + options.lookupType;
    }
    let result = {
        ajax : {
            url : url,
            data : function(params) {
                let result = {
                    mimetype : 'json'
                };
                if (options.parentId) {
                    result[options.parentId] = options.getParentId();
                }
                if (has(params, 'term')) {
                    result.text = params.term;
                }
                return result;
            }
        }
    };

    // This is a special case where two lookup's are needed to fetch the active and not active values.
    // To do this, we redefined the transport function to make the two ajax calls, returning a
    // deferred which is resolved after both calls are done.
    if (has(options, 'subgroups') && has(options.subgroups, 'queryParameter') && has(options.subgroups, 'nameAndValues') &&
        options.subgroups.nameAndValues.length) {
        result.ajax.transport = function(params, success, failure) {
            let deferred = $.Deferred();
            let subgroupRequests = [];
            options.subgroups.nameAndValues.forEach((subgroup) => {
                let data = clone(params.data);
                data[options.subgroups.queryParameter] = subgroup.value;
                subgroupRequests.push($.ajax(extend(clone(params), {data: data})));
            });

            $.when(...subgroupRequests).always(function() {
                const results = Array.from(arguments).map((arg) => arg[0]);
                deferred.resolve(results);
            });
            deferred.done(success);
            deferred.fail(failure);

            return deferred;
        };
        result.ajax.processResults = function(responses) {
            let resultsData = [];
            responses.forEach((resp, index) => {
                resultsData.push({
                    text: options.subgroups.nameAndValues[index].name,
                    children: resp.slice(0, SUBGROUP_CHILDREN_LIMIT)
                });
            });
            return {
                results: resultsData
            };
        };
    } else {
        result.ajax.processResults = function(resp) {
            return {
                results : resp
            };
        };
    }

    return extend(result, defaults ? defaults : {});
};
