import _ from 'underscore';
import $ from 'jquery';


/*
 * @param {Object} options
 *     @prop {String or Function which returns a String} lookupType - Used to form the url. It is appended to the lookupUrl in the module config.
 *     @prop {String} parentId(optional) - parameter name to be used when retrieving the lookup
 *     @prop {Function} getParentId - optional but should be specified if parentId is specified.
 *                 Function should return a String that will be used as the parentId value when retrieving the lookup
 *     @prop {Boolean} activeSubgroup (optional) - If true, the select2 data will be grouped by active and inactive.
 * @param {Object} defaults(optional) - select2Options which will be merged with the ajax option set by this function
 */
 export const getSelectOptions = function(options, defaults) {
    var url;
    if (_.isFunction(options.lookupType)) {
        url = function() {
            return window.CONFIG.lookupUrl + options.lookupType();
        };
    } else {
        url = window.CONFIG.lookupUrl + options.lookupType;
    }
    var result = {
        ajax : {
            url : url,
            data : function(params) {
                var result = {
                    mimetype : 'json'
                };
                if (options.parentId) {
                    result[options.parentId] = options.getParentId();
                }
                if (_.has(params, 'term')) {
                    result.text = params.term;
                }
                return result;
            }
        }
    };

    // This is a special case where two lookup's are needed to fetch the active and not active values.
    // To do this, we redefined the transport function to make the two ajax calls, returning a
    // deferred which is resolved after both calls are done.
    if (_.has(options, 'activeSubgroup')) {
        result.ajax.transport = function(params, success, failure) {
            var deferred = $.Deferred();
            var activeData = _.clone(params.data);
            var notActiveData = _.clone(params.data);
            var activeRequest, notActiveRequest;

            activeData.active = 'y';
            activeRequest = $.ajax(_.extend(_.clone(params), {data : activeData}));
            notActiveData.active = 'n';
            notActiveRequest = $.ajax(_.extend(_.clone(params), {data : notActiveData}));

            $.when(activeRequest, notActiveRequest).always(function(activeResults, notActiveResults) {
                deferred.resolve([activeResults, notActiveResults]);
            });
            deferred.done(success);
            deferred.fail(failure);

            return deferred;
        };
        result.ajax.processResults = function(resp) {
            var results = {
                results: [{
                    text: 'Active',
                    children: []
                }, {
                    text: 'Not Active',
                    children: []
                }]
            };
            if (resp.length === 2 && resp[0].length === 3 && resp[1].length === 3) {
                results.results[0].children = resp[0][0].slice(0, 30);
                results.results[1].children = resp[1][0].slice(0, 30);
            }
            return results;
        };
    } else {
        result.ajax.processResults = function(resp) {
            return {
                results : resp
            };
        };
    }

    return _.extend(result, defaults ? defaults : {});
};
