/* jslint browser: true */

define([
	'sinon',
	'models/PublicationModel'
], function(sinon, PublicationModel) {
	"use strict";

	describe("PublicationModel", function() {
		var server;

		beforeEach(function() {
			server = sinon.fakeServer.create();
		});

		afterEach(function() {
			server.restore();
		});

		describe('Tests for fetch', function() {
			var model;
			var validId = 1234;
			var invalidId = 5678;

			var doneSpy, failSpy;

			beforeEach(function() {
				doneSpy = jasmine.createSpy('doneSpy');
				failSpy = jasmine.createSpy('failSpy');

				model = new PublicationModel();

				server.respondWith(model.urlRoot + '/' + validId + '?mimetype=json', [200, {"Content-Type" : 'application/json'},
					'{"id" : 1234, "title" : "This is a Title", "publicationYear" : 2015}'
				]);

				server.respondWith(model.urlRoot + '/' + invalidId + '?mimetype=json', [404, {}, 'Pub Not Found']);
			});

			it('Expects that a call to fetch add the mimeType and any other specified parameters to the ajax call', function() {
				model.set('id', validId);
				model.fetch();
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toMatch(model.urlRoot + '/' + validId);
				expect(server.requests[0].url).toMatch('mimetype=json');

				model.fetch({headers : {'Accept' : 'application/json'}});
				expect(server.requests.length).toBe(2);
				expect(server.requests[1].url).toMatch('mimetype=json');
				expect(server.requests[1].requestHeaders['Accept']).toEqual('application/json');
			});

			it('Expects that call to fetch with a valid Id will update the model', function() {
				model.set('id', validId);
				model.fetch().done(doneSpy).fail(failSpy);
				server.respond();
				expect(doneSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
				expect(model.attributes).toEqual({
					id : validId,
					title : 'This is a Title',
					publicationYear : 2015
				});
			})

			it('Expects that a call to fetch with an invalid id will not update the model', function() {
				model.set('id', invalidId);
				model.fetch().done(doneSpy).fail(failSpy);
				server.respond();
				expect(doneSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(model.attributes).toEqual({id : invalidId});
			});
		});

		describe('Tests for release', function(){
			var model;

			var doneSpy, failSpy;

			beforeEach(function() {
				doneSpy = jasmine.createSpy('doneSpy');
				failSpy = jasmine.createSpy('failSpy');

				model = new PublicationModel();

			});

			it('Expects that a call to release returns an empty resolved promise if the model is new', function() {
				model.release().done(doneSpy).fail(failSpy);
				expect(doneSpy).toHaveBeenCalledWith();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a call to release on a non-empty model sets up a request with the appropriate url and body', function() {
				model.set('id', 1234);
				model.release();
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toEqual(model.urlRoot + '/release');
				expect(server.requests[0].method).toEqual('POST');
				expect(server.requests[0].requestBody).toEqual('{"id" : 1234}');
			});

			it('Expects that a call to release with succeeds resolves the promise with the response', function() {
				server.respond([200, {"Content-Type" : 'application/json'},
					'{"id" : 1234, "title" : "This is a Title", "publicationYear" : 2015, "validationErrors" : []}'
				]);
				model.set('id', 1234);
				model.release().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).toHaveBeenCalledWith({
					id : 1234,
					title : 'This is a Title',
					publicationYear : 2015,
					validationErrors : []
				});
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a call to release which fails with validationErrors rejects the promise with the validationErrors', function() {
				server.respond([400, {"Content-Type" : 'application/json'},
					'{"validationErrors" : ["One error"]}'
				]);
				model.set('id', 1234);
				model.release().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalledWith(['One error']);
				expect(model.get('validationErrors')).toEqual(['One error']);
			});

			it('Expects that a call to release which fails without validationErrors rejects the promise with an error message', function() {
				server.respond([500, {}, 'Server error']);
				model.set('id', 1234);
				model.release().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(failSpy.calls.argsFor(0)[0]).toMatch('Internal Server Error');
			})
		});

		describe('Tests for publish', function(){
			var model;

			var doneSpy, failSpy;

			beforeEach(function() {
				doneSpy = jasmine.createSpy('doneSpy');
				failSpy = jasmine.createSpy('failSpy');

				model = new PublicationModel();

			});

			it('Expects that a call to publish returns an empty resolved promise if the model is new', function() {
				model.publish().done(doneSpy).fail(failSpy);
				expect(doneSpy).toHaveBeenCalledWith();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a call to publish on a non-empty model sets up a request with the appropriate url and body', function() {
				model.set('id', 1234);
				model.publish();
				expect(server.requests.length).toBe(1);
				expect(server.requests[0].url).toEqual(model.urlRoot + '/publish');
				expect(server.requests[0].method).toEqual('POST');
				expect(server.requests[0].requestBody).toEqual('{"id" : 1234}');
			});

			it('Expects that a call to publish with succeeds resolves the promise with the response', function() {
				server.respond([200, {"Content-Type" : 'application/json'},
					'{"id" : 1234, "title" : "This is a Title", "publicationYear" : 2015, "validationErrors" : []}'
				]);
				model.set('id', 1234);
				model.publish().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).toHaveBeenCalledWith({
					id : 1234,
					title : 'This is a Title',
					publicationYear : 2015,
					validationErrors : []
				});
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a call to publish which fails with validationErrors rejects the promise with the validationErrors', function() {
				server.respond([400, {"Content-Type" : 'application/json'},
					'{"validationErrors" : ["One error"]}'
				]);
				model.set('id', 1234);
				model.publish().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalledWith(['One error']);
				expect(model.get('validationErrors')).toEqual(['One error']);
			});

			it('Expects that a call to publish which fails without validationErrors rejects the promise with an error message', function() {
				server.respond([500, {}, 'Server error']);
				model.set('id', 1234);
				model.publish().done(doneSpy).fail(failSpy);
				server.respond();

				expect(doneSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(failSpy.calls.argsFor(0)[0]).toMatch('Internal Server Error');
			})
		});
	});

});
