/*jslint browser: true */

define([
	'underscore',
	'backbone'
], function(_, Backbone) {
	"use strict";

	var model = Backbone.Model.extend({
		urlRoot : '/manager/services/mppublications/',
/*
		defaults : function() {
			return {
				additionalOnlineFiles: 'N',
				chapter: '',
				city: '',
				collaboration: '',
				conferenceDate: '',
				conferenceLocation: '',
				conferenceTitle: '',
				contact: '',
				contributors : {},
				costCenters: [],
				country: '',
				county: '',
				datum: '',
				displayToPublicDate : '',
				docAbstract: '',
				doi: '',
				edition: '',
				endPage: '',
				geographicExtents: '',
				id: '',
				indexId: '',
				ipdsId: '',
				isPartOf: {},
				isbn: '',
				issn: '',
				issue: '',
				language: '',
				largerWorkSubtype: {
					id : ''
				},
				largerWorkTitle: '',
				largerWorkType: {
					id : ''
				},
				links: [],
				notes: '',
				numberOfPages: '',
				onlineOnly: 'N',
				otherGeospatial: '',
				productDescription: '',
				projection: '',
				publicComments: '',
				publicationSubtype: {
					id: ''
				},
				publicationType: {
					id : ''
				},
				publicationYear: '',
				publishedDate : '',
				publisher: '',
				publisherLocation: '',
				publishingServiceCenter: {
					id : ''
				},
				revisedDate : '',
				scale: '',
				seriesNumber: '',
				seriesTitle: {
					id: ''
				},
				startPage: '',
				state: '',
				subchapterNumber: '',
				subseriesTitle: '',
				supersededBy: {},
				tableOfContents: '',
				temporalEnd : '',
				temporalStart : '',
				text: '',
				title: '',
				usgsCitation: '',
				validationErrors: [],
				volume: ''
			};
		},
		*/

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
