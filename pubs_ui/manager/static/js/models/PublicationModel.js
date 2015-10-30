/*jslint browser: true */

define([
	'underscore',
	'jquery',
	'backbone'
], function(_, $, Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		urlRoot : '/manager/services/mppublications',

		/*
		Need to remove interactions and text to work around an issue with some properties being returned that shouldn't be.
		When PUBSTWO-1272 has been resolved, this can be removed.
		 */
		parse : function(response, options) {
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
							deferred.reject(resp.validationErrors);
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

		release : function() {
			return this.changeState('release');
		},

		publish : function() {
			return this.changeState('publish');
		}
	});

	return model;
});
