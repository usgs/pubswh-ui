/* jslint browser: true */

define([
	'backbone',
	'controller/AppRouter'
], function (Backbone, AppRouter) {
	"use strict";

	var router = new AppRouter();
	Backbone.history.start({
		root: PUBS.CONFIG.script_root + '/manager/'
	});

	return router;
});
