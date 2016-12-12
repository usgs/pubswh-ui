/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, sinon, jasmine */
/* global METRICS */
/* global $ */
/* global moment */
/* global CONFIG */

describe('analyticsData', function() {
	"use strict";

	var fakeserver;

	beforeEach(function() {
		fakeserver = sinon.fakeServer.create();
	});

	afterEach(function() {
		fakeserver.restore();
	});

	describe('Tests for batchFetchMonthlyPastYear', function() {
		var successSpy, failSpy;
		var GA_ENDPOINT = CONFIG.JSON_LD_ID_BASE_URL + 'metrics/gadata/';
		var fetchParams = [
			{
				metrics: [{expression: 'ga:sessions'}],
				dimFilters : [{
					filters: [{dimensionName: 'ga:pagePath', operator: 'EXACT', expressions: ['pub/test']}]
				}]
			}, {
				metrics: [{expression: 'ga:eventCategory'}],
				dimFilters: [{
					operator: 'AND',
					filters: [
						{dimensionName: 'ga:pagePath', operator: 'EXACT', expressions: ['pub/test']},
						{dimensionName: 'ga:eventCategory', operator: 'EXACT', expressions: ['Downloads']}
					]
				}]
			}
		];

		beforeEach(function() {
			successSpy = jasmine.createSpy('successSpy');
			failSpy = jasmine.createSpy('failSpy');
		});

		it('Expects that the payload to the GA_ENDPOINT properly encodes the inputs', function() {
			var requestBody;
			METRICS.analyticsData.batchFetchMonthlyPastYear(fetchParams);

			expect(fakeserver.requests.length).toBe(1);
			expect(fakeserver.requests[0].url).toEqual(GA_ENDPOINT);
			requestBody = $.parseJSON(fakeserver.requests[0].requestBody);
			expect(requestBody.length).toBe(2);
			expect(requestBody[0].dimensions[0].name).toEqual('ga:yearMonth');
			expect(requestBody[0].metrics).toEqual(fetchParams[0].metrics);
			expect(requestBody[0].dimensionFilterClauses).toEqual(fetchParams[0].dimFilters);
			expect(requestBody[1].dimensions[0].name).toEqual('ga:yearMonth');
			expect(requestBody[1].metrics).toEqual(fetchParams[1].metrics);
			expect(requestBody[1].dimensionFilterClauses).toEqual(fetchParams[1].dimFilters);
		});

		it('Expects that the dateRange is the past year from the date passed into the function', function() {
			var requestBody;
			METRICS.analyticsData.batchFetchMonthlyPastYear(fetchParams, moment('20101015', 'YYYYMMDD'));
			requestBody = $.parseJSON(fakeserver.requests[0].requestBody);

			expect(requestBody[0].dateRanges.length).toBe(1);
			expect(requestBody[0].dateRanges[0].startDate).toEqual('2009-10-01');
			expect(requestBody[0].dateRanges[0].endDate).toEqual('2010-09-30');
			expect(requestBody[1].dateRanges.length).toBe(1);
			expect(requestBody[1].dateRanges[0].startDate).toEqual('2009-10-01');
			expect(requestBody[1].dateRanges[0].endDate).toEqual('2010-09-30');
		});

		it('Expects that a failed response will reject the promise', function() {
			fakeserver.respondWith([500, {"Content-Type" : 'text/html'}, 'Internal server error']);
			METRICS.analyticsData.batchFetchMonthlyPastYear(fetchParams).done(successSpy).fail(failSpy);

			expect(successSpy).not.toHaveBeenCalled();
			expect(failSpy).not.toHaveBeenCalled();

			fakeserver.respond();
			expect(successSpy).not.toHaveBeenCalled();
			expect(failSpy).toHaveBeenCalled();
		});

		it('Expects that a successful response will resolve the promise', function() {
			fakeserver.respondWith([200, {'Content-Type' : 'application/json'},
				'{"reports" : [{"columnHeader" : {"metricHeader" : {"metricHeaderEntries" : [{"name" : "ga:sessions"}]}}}]}']);
			METRICS.analyticsData.batchFetchMonthlyPastYear(fetchParams).done(successSpy).fail(failSpy);
			fakeserver.respond();

			expect(successSpy).toHaveBeenCalled();
			expect(failSpy).not.toHaveBeenCalled();

		});
	});

	describe('Tests for batchFetchPast30Days', function() {
		var successSpy, failSpy;
		var GA_ENDPOINT = CONFIG.JSON_LD_ID_BASE_URL + 'metrics/gadata/';
		var fetchParams = [
			{
				metrics: [{expression: 'ga:sessions'}],
				dimFilters : [{
					filters: [{dimensionName: 'ga:pagePath', operator: 'EXACT', expressions: ['pub/test']}]
				}]
			}, {
				metrics: [{expression: 'ga:eventCategory'}],
				dimFilters: [{
					operator: 'AND',
					filters: [
						{dimensionName: 'ga:pagePath', operator: 'EXACT', expressions: ['pub/test']},
						{dimensionName: 'ga:eventCategory', operator: 'EXACT', expressions: ['Downloads']}
					]
				}]
			}
		];

		beforeEach(function() {
			successSpy = jasmine.createSpy('successSpy');
			failSpy = jasmine.createSpy('failSpy');
		});

		it('Expects that the payload to the GA_ENDPOINT properly encodes the inputs', function() {
			var requestBody;
			METRICS.analyticsData.batchFetchPast30Days(fetchParams);

			expect(fakeserver.requests.length).toBe(1);
			expect(fakeserver.requests[0].url).toEqual(GA_ENDPOINT);
			requestBody = $.parseJSON(fakeserver.requests[0].requestBody);
			expect(requestBody.length).toBe(2);
			expect(requestBody[0].dimensions[0].name).toEqual('ga:date');
			expect(requestBody[0].metrics).toEqual(fetchParams[0].metrics);
			expect(requestBody[0].dimensionFilterClauses).toEqual(fetchParams[0].dimFilters);
			expect(requestBody[1].dimensions[0].name).toEqual('ga:date');
			expect(requestBody[1].metrics).toEqual(fetchParams[1].metrics);
			expect(requestBody[1].dimensionFilterClauses).toEqual(fetchParams[1].dimFilters);
		});

		it('Expects that the dateRange is the past year from the date passed into the function', function() {
			var requestBody;
			METRICS.analyticsData.batchFetchPast30Days(fetchParams, moment('20101015', 'YYYYMMDD'));
			requestBody = $.parseJSON(fakeserver.requests[0].requestBody);

			expect(requestBody[0].dateRanges.length).toBe(1);
			expect(requestBody[0].dateRanges[0].startDate).toEqual('2010-09-15');
			expect(requestBody[0].dateRanges[0].endDate).toEqual('2010-10-15');
			expect(requestBody[1].dateRanges.length).toBe(1);
			expect(requestBody[1].dateRanges[0].startDate).toEqual('2010-09-15');
			expect(requestBody[1].dateRanges[0].endDate).toEqual('2010-10-15');
		});

		it('Expects that a failed response will reject the promise', function() {
			fakeserver.respondWith([500, {"Content-Type" : 'text/html'}, 'Internal server error']);
			METRICS.analyticsData.batchFetchPast30Days(fetchParams).done(successSpy).fail(failSpy);

			expect(successSpy).not.toHaveBeenCalled();
			expect(failSpy).not.toHaveBeenCalled();

			fakeserver.respond();
			expect(successSpy).not.toHaveBeenCalled();
			expect(failSpy).toHaveBeenCalled();
		});

		it('Expects that a successful response will resolve the promise', function() {
			fakeserver.respondWith([200, {'Content-Type' : 'application/json'},
				'{"reports" : [{"columnHeader" : {"metricHeader" : {"metricHeaderEntries" : [{"name" : "ga:sessions"}]}}}]}']);
			METRICS.analyticsData.batchFetchPast30Days(fetchParams).done(successSpy).fail(failSpy);
			fakeserver.respond();

			expect(successSpy).toHaveBeenCalled();
			expect(failSpy).not.toHaveBeenCalled();

		});
	});
});
