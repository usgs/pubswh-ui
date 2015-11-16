/*jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone',
	'module',
	'models/LinkCollection'
], function(_, $, Backbone, module, LinkCollection) {
	"use strict";

	var model = Backbone.Model.extend({
		urlRoot : module.config().scriptRoot + '/manager/services/mppublications',

		defaults : function() {
			return {
				links: new LinkCollection()
			}
		},

		parse : function(response, options) {
			var links = this.get('links');
			if (_.has(response, 'links')) {
				links.set(response.links);
				links.sort();
				response.links = links;
			}
			/*
				Need to remove interactions and text to work around an issue with some properties being returned that shouldn't be.
				When PUBSTWO-1272 has been resolved, this code can be removed.
		 	*/
			return _.omit(response, ['interactions', 'text']);
		},

		fetch : function(options) {
			var params = {
				data : {
					mimetype : 'json'
				}
			};
			if (_.isObject(options)) {
				_.extend(params, options);
			}
			return Backbone.Model.prototype.fetch.call(this, params);
		},

		/*
		 * @param {String} op - command that will be added to the url to perform an action on the pub
		 * @return {Jquery.Promise} - If the model is empty, resolves returning nothing. If not emtpy,
		 *     resolves with the received response if call succeeds, rejects with the validationErrors
		 *     array if the response contains validation errors, rejects with an error message if the failed response does
		 *     not contain validation errors.
		 */
		changeState : function(op) {
			var self = this;
			var deferred = $.Deferred();
			if (!this.isNew()) {
				$.ajax({
					url: this.urlRoot +  '/' + op,
					method : 'POST',
					headers : {
						'Accept' : 'application/json'
					},
					contentType : 'application/json',
					processData : false,
					data: '{"id" : ' + this.get('id') + '}',
					success : function(response) {
						deferred.resolve(response)
					},
					error : function(jqXHR, textStatus, error) {
						var resp = jqXHR.responseJSON;
						if (_.has(resp, 'validationErrors')
							&& _.isArray(resp.validationErrors)
							&& (resp.validationErrors.length > 0)) {
							self.set('validationErrors', resp.validationErrors);
							deferred.reject(resp);
						}
						else {
							deferred.reject('Unable to ' + op + ' the publication with error: ' + error);
						}
					}
				});
			}
			else {
				deferred.resolve();
			}
			return deferred.promise();
		},

		/*
		 * @return {Jquery.Promise} - resolves with the received response if the release succeeds, rejects with the validationErrors
		 *     array if the response contains validation errors, rejects with an error message if the failed response does
		 *     not contain validation errors.
		 */
		release : function() {
			return this.changeState('release');
		},

		/*
		 * @return {Jquery.Promise} - resolves with the received response if publish succeeds, rejects with the validationErrors
		 *     array if the response contains validation errors, rejects with an error message if the failed response does
		 *     not contain validation errors.
		 */
		publish : function() {
			return this.changeState('publish');
		},

		save : function(attributes, options) {
			/* Don't send validationErrors to the server */
			this.unset('validationErrors');
			return Backbone.Model.prototype.save.apply(this, arguments);
		}
	});

	return model;
});
