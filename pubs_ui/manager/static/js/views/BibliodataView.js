/* jslint browser: true */

define([
	'handlebars',
	'backbone.stickit',
	'views/BaseView',
	'text!hb_templates/bibliodata.hbs'
], function(Handlebars, stickit, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		bindings : {
			'#pub-type-input' :
		},

		template : Handlebars.compile(hbTemplate)
	});

	return view;
});