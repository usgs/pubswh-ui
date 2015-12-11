/* jslint browser: true */

define([
	'underscore',
	'module',
], function(_, module) {
	"use strict";
	/*
	 * @param {Object} options
	 *     @prop {String or Function which returns a String} lookupType - Used to form the url. It is appended to the lookupUrl in the module config.
	 *     @prop {String} parentId(optional) - parameter name to be used when retrieving the lookup
	 *     @prop {Function} getParentId - optional but should be specified if parentId is specified.
	 *                 Function should return a String that will be used as the parentId value when retrieving the lookup
	 * @param {Object} defaults - select2Options which will be merged with the ajax option set by this function
	 */
	var getSelectOptions = function(options, defaults) {
		var url;
		if (_.isFunction(options.lookupType)) {
			url = function() {
				return module.config().lookupUrl + options.lookupType();
			};
		}
		else {
			url = module.config().lookupUrl + options.lookupType;
		}
		var result = {
			ajax : {
				url : url,
				data : function(params) {
					var result = {
						mimetype : 'json'
					}
					if (options.parentId) {
						result[options.parentId] = options.getParentId();
					}
					if (_.has(params, 'term')) {
						result.text = params.term;
					}
					return result;
				},
				processResults : function(resp) {
					return {
						results : resp
					}
				}
			}
		};

		return _.extend(result, defaults);
	}

	return {
		getSelectOptions : getSelectOptions
	}
})