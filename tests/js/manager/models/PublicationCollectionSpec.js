/* jslint browser: true */

define([
	'sinon',
	'models/PublicationCollection'
], function(sinon, PublicationCollection) {
	"use strict";

	describe("PublicationCollection", function() {
		var server;
		var collection;

		beforeEach(function() {
			server = sinon.fakeServer.create();
			collection = new PublicationCollection();

		});

		afterEach(function() {
			server.restore();
		});

		describe('Tests for fetch', function() {

			it('Expects that a call to fetch adds the correct parameters to the ajax call', function() {
				collection.fetch();
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toMatch('page_row_start=0');
				expect(server.requests[0].url).toMatch('page_size=100');
			});

		});

		describe('Tests for using filters', function() {
			it('Expects that updateFilters replaces the existing filters and getFilters retrieves the existing filter', function() {
				expect(collection.getFilters()).toEqual({});
				collection.updateFilters({f1 : 'Text1'});
				expect(collection.getFilters()).toEqual({f1 : 'Text1'});
				collection.updateFilters({f2 : 'Text2', f3 : 'Text3'});
				expect(collection.getFilters()).toEqual({f2 : 'Text2', f3 : 'Text3'});
			});

			it('Expects the filter parameters to be added to the request url when fetch is called', function() {
				collection.updateFilters({f1 : 'Text1'});
				collection.fetch();
				expect(server.requests[0].url).toMatch('f1=Text1');

				collection.updateFilters({f2 : ['Text1', 'Text2'], f3 : 'Text3'});
				collection.fetch();
				expect(server.requests[1].url).toMatch('f2=Text1&f2=Text2&f3=Text3');
			});
		});

	});

});