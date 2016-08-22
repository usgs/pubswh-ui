/* jslint browser: true */
/* global define */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn, sinon */

define([
	'jquery',
	'models/AffiliationModel',
	'views/BaseView',
	'views/ManageAffiliationView'
], function($, AffiliationModel, BaseView, ManageAffiliationView) {
	"use strict";

	fdescribe('views/ManageAffiliationView', function() {
		var testView;
		var $testDiv;
		var testModel;
		var testRouter;
		var fakeServer;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>')
			$testDiv = $('test-div');

			fakeServer = sinon.fakeServer.create();

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'render').and.callThrough();

			testModel = new AffiliationModel();
			testRouter = jasmine.createSpyObj('testRouterSpy', ['navigate']);
			testView = new ManageAffiliationView({
				el : $testDiv,
				model : testModel,
				router : testRouter
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
			fakeServer.restore();
		});
	});
});