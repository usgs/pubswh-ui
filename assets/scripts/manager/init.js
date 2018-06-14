/* jslint browser: true */
/* global define */

define([
	'backbone',
	'loglevel',
	'controller/AppRouter',
	'module'
], function (Backbone, log, AppRouter, module) {
		var config = module.config();

	if (config.jsDebug) {
		log.setLevel('debug', false);
	} else {
		log.setLevel('warn', false);
	}
	var router = new AppRouter();

	Backbone.history.start({
		root: config.scriptRoot + '/manager/'
	});

	return router;
});
