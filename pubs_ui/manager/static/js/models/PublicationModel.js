/*jslint browser: true */

define([
	'underscore',
	'backbone'
], function(_, Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		urlRoot : '/manager/services/mppublications/',


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

		release : function() {
			var deferred = $.Deferred();
			if (this.has('id')) {
				$.ajax({
					url: this.urlRoot + 'release',
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
						var resp = jqXHR.responseText;
						if (resp.validationErrors && (resp.validationErrors > 0)) {
							this.set('validationErrors', resp.validationErrors);
							deferred.reject(resp.validationErrors);
						}
						else {
							deferred.reject('Unable to release Publication with error: ' + error);
						}
					}
				});
			}
			else {
				deferred.resolve();
			}
			return deferred.promise();
		}
	});

	return model;
});
