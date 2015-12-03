/* jslint browser: true */

define([
	'sinon',
	'models/PublicationCollection'
], function(sinon, PublicationCollection) {
	"use strict";

	describe("PublicationCollection", function() {
		var server;

		beforeEach(function() {
			server = sinon.fakeServer.create();
		});

		afterEach(function() {
			server.restore();
		});

		describe('Tests for fetch', function() {
			var collection;

			beforeEach(function() {

				collection = new PublicationCollection();

			});

			it('Expects that a call to fetch adds the correct parameters to the ajax call', function() {

				collection.fetch();
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toMatch('page_row_start=0');
				expect(server.requests[0].url).toMatch('page_size=100');
			});

		});

	});

});