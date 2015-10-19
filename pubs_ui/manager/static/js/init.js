/* jslint browser: true */

define([
	'backbone',
	'controller/AppRouter',
	'module'
], function (Backbone, AppRouter, module) {
	"use strict";

	var router = new AppRouter();
	Backbone.history.start({
		root: module.config().scriptRoot + '/manager/'
	});

	return router;
});
